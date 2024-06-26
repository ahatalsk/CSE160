// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';





// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveFrawingBuffer: true });
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
    
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }
    
    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }
    
    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }
    
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}



// UI element globals
let g_animation = false;
let g_event = false;
let g_globalAnglex = 0;
let g_globalAngley = 0;
let g_vertical = false;
let g_tailAngle1 = 0;
let g_tailAngle2 = 0;
let g_tailAngle3 = 0;
let g_tailAngle4 = 0;
let g_tailAngle5 = 0;
let g_jawAngle = 30;
let g_finx = -15;
let g_finy = -15;
let g_eyebrowWidth = 0.1;
let g_littleFishLocation = 0.4;



// Set up actions for the HTML UI elements
function addActionsForHTML() {
    // Button Events
    document.getElementById('animationOnButton').onclick = function() {
        g_animation = true;
    };
    document.getElementById('animationOffButton').onclick = function() {
        g_animation = false;
    };
    
    document.getElementById('frontButton').onclick = function() {
        g_globalAnglex = 0;
        g_globalAngley = 0;
    };
    document.getElementById('backButton').onclick = function() {
        g_globalAnglex = 180;
        g_globalAngley = 0;
    };
    document.getElementById('topButton').onclick = function() {
        g_globalAnglex = 0;
        g_globalAngley = -90;
    };
    document.getElementById('bottomButton').onclick = function() {
        g_globalAnglex = 0;
        g_globalAngley = 90;
    };
    document.getElementById('headButton').onclick = function() {
        g_globalAnglex = -90;
        g_globalAngley = 0;
    };
    document.getElementById('tailButton').onclick = function() {
        g_globalAnglex = 90;
        g_globalAngley = 0;
    };
    

    
    // Slider Events
    document.getElementById('tail1Slide').addEventListener('mousemove', function() {
        g_tailAngle1 = this.value;
    });
    document.getElementById('tail2Slide').addEventListener('mousemove', function() {
        g_tailAngle2 = this.value;
    });
    document.getElementById('tail3Slide').addEventListener('mousemove', function() {
        g_tailAngle3 = this.value;
    });
    document.getElementById('tail4Slide').addEventListener('mousemove', function() {
        g_tailAngle4 = this.value;
    });
    document.getElementById('tail5Slide').addEventListener('mousemove', function() {
        g_tailAngle5 = this.value;
    });
    
    document.getElementById('jawSlide').addEventListener('mousemove', function() {
        g_jawAngle = this.value;
    });
}





// Complete setup and start the rendering sequence
function main() {
        setupWebGL();
        connectVariablesToGLSL();
        
        // Set up actions for the HTML UI elements
        addActionsForHTML();
    
        // Register the event function to be called when the canvas is clicked
        canvas.onclick = function(ev) {
            // If shift is being held, invoke special event, otherwise rotate
            if (ev.shiftKey) {
                g_event = true;
                g_eventStartTime = performance.now()/1000.0;
                g_secondsSinceEvent = 0.0;
            } else {
                [x, y] = convertCoordinatesEventToGL(ev);
                g_globalAnglex += x * 45;
                g_globalAngley += y * 45;
            }
        }

        // Specify the color for clearing <canvas>
        gl.clearColor(0.11, 0.21, 0.45, 1.0);

        // Start rendering sequence
        requestAnimationFrame(tick);
}



// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}




// To calculate animation angles
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

var g_eventStartTime = performance.now()/1000.0;
var g_secondsSinceEvent = performance.now()/1000.0; - g_eventStartTime;

// Called by browser repeatedly to render the scene
function tick() {
    
    g_seconds = performance.now()/1000.0 - g_startTime;
    g_secondsSinceEvent = performance.now()/1000.0 - g_eventStartTime;
    
    // Changes the animation angles if needed
    updateAnimationAngles();
    
    // Renders the canvas
    renderScene();
    
    // Repeat the sequence
    requestAnimationFrame(tick);
}





function updateAnimationAngles() {
    if (g_event) {
        // If it has been > 6.4 seconds, the event is over
        if (g_secondsSinceEvent > 6.4) {
            g_eyebrowWidth = 0.1;
            g_event = false;
        } else {
            g_littleFishLocation = 2.0 - (g_secondsSinceEvent/4.0);
            
            g_tailAngle1 = (15 * Math.sin(5 * g_seconds));
            g_tailAngle2 = (15 * Math.sin(5 * g_seconds - 1));
            g_tailAngle3 = (15 * Math.sin(5 * g_seconds - 2));
            g_tailAngle4 = (15 * Math.sin(5 * g_seconds - 3));
            g_tailAngle5 = (15 * Math.sin(g_seconds - 4));
            g_finx = (-15 * Math.sin(5 * -g_seconds));
            g_finy = (-15 * Math.cos(5 * g_seconds));
            g_jawAngle = (15 * Math.sin(5 * g_secondsSinceEvent) + 15);
            g_eyebrowWidth = 0.3;
            
            // Update the angles in the html sliders
            let tail1Slide = document.getElementById('tail1Slide');
            tail1Slide.value = g_tailAngle1;
            let tail2Slide = document.getElementById('tail2Slide');
            tail2Slide.value = g_tailAngle2;
            let tail3Slide = document.getElementById('tail3Slide');
            tail3Slide.value = g_tailAngle3;
            let tail4Slide = document.getElementById('tail4Slide');
            tail4Slide.value = g_tailAngle4;
            let tail5Slide = document.getElementById('tail5Slide');
            tail5Slide.value = g_tailAngle5;
            let jawSlide = document.getElementById('jawSlide');
            jawSlide.value = g_jawAngle;
        }
    } else if (g_animation) {
        // Calculate the angles
        g_tailAngle1 = (15 * Math.sin(g_seconds));
        g_tailAngle2 = (15 * Math.sin(g_seconds - 1));
        g_tailAngle3 = (15 * Math.sin(g_seconds - 2));
        g_tailAngle4 = (15 * Math.sin(g_seconds - 3));
        g_tailAngle5 = (15 * Math.sin(g_seconds - 4));
        g_finx = (-15 * Math.sin(-g_seconds));
        g_finy = (-15 * Math.cos(g_seconds));
        g_jawAngle = (15 * Math.sin(g_seconds) + 15);
        
        // Update the angles in the html sliders
        let tail1Slide = document.getElementById('tail1Slide');
        tail1Slide.value = g_tailAngle1;
        let tail2Slide = document.getElementById('tail2Slide');
        tail2Slide.value = g_tailAngle2;
        let tail3Slide = document.getElementById('tail3Slide');
        tail3Slide.value = g_tailAngle3;
        let tail4Slide = document.getElementById('tail4Slide');
        tail4Slide.value = g_tailAngle4;
        let tail5Slide = document.getElementById('tail5Slide');
        tail5Slide.value = g_tailAngle5;
        let jawSlide = document.getElementById('jawSlide');
        jawSlide.value = g_jawAngle;
    }
}
   
         
         
         
         
// Draw every shape that is supposed to be in the canvas
function renderScene() {
    // Check time at the start of the function
    var startTime = performance.now();
        
    // Pass the angle matrix to u_GlobalRotateMatrix
    var globalRotMat = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
    globalRotMat.rotate(g_globalAngley, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var bodyColor = [0.51, 0.77, 0.25, 1.0];
    var bellyColor = [0.96, 0.94, 0.82, 1.0];
    var stripeColor = [0.78, 0.27, 0.41, 1.0];
    var finColor = [0.28, 0.43, 0.08, 1.0];
    var detailColor = [0.44, 0.30, 0.1, 1.0];
    var mouthColor = [0.23, 0.06, 0.09, 1.0];
    var littleFishColor = [0.79, 0.54, 0.18, 1.0];
    
    
    
    // Body of the fish
    var body = new Cube();
    body.color = bodyColor;
    body.matrix.translate(-0.15, -0.35, 0.0);
    body.matrix.rotate(g_tailAngle1, 0, 1, 0);
    body.matrix.scale(0.3, 0.7, 0.3);
    body.matrix.translate(0.0, 0.0, -0.5);
    body.render();
    
    var bodyBelly = new Cube();
    bodyBelly.color = bellyColor;
    bodyBelly.matrix = new Matrix4(body.matrix);
    bodyBelly.matrix.translate(-0.001, -0.001, -0.001);
    bodyBelly.matrix.scale(1.01, 0.35, 1.01);
    bodyBelly.render();
    
    var bodyStripe = new Cube();
    bodyStripe.color = stripeColor;
    bodyStripe.matrix = new Matrix4(body.matrix);
    bodyStripe.matrix.translate(-0.001, 0.35, -0.001);
    bodyStripe.matrix.scale(1.01, 0.4, 1.01);
    bodyStripe.render();
    
    var body2 = new Cube();
    body2.color = bodyColor;
    body2.matrix = new Matrix4(body.matrix);
    body2.matrix.translate(0.8, 0.025, 0.5);
    body2.matrix.scale(0.8, 0.95, 0.95);
    body2.matrix.rotate(g_tailAngle2, 0, 1, 0);
    body2.matrix.translate(0.0, 0.0, -0.5);
    body2.render();
    
    var body2Belly = new Cube();
    body2Belly.color = bellyColor;
    body2Belly.matrix = new Matrix4(body2.matrix);
    body2Belly.matrix.translate(0.001, -0.001, -0.001);
    body2Belly.matrix.scale(1.01, 0.35, 1.01);
    body2Belly.render();
    
    var body2Stripe = new Cube();
    body2Stripe.color = stripeColor;
    body2Stripe.matrix = new Matrix4(body2.matrix);
    body2Stripe.matrix.translate(-0.001, 0.35, -0.001);
    body2Stripe.matrix.scale(1.01, 0.4, 1.01);
    body2Stripe.render();
    
    var body3 = new Cube();
    body3.color = bodyColor;
    body3.matrix = new Matrix4(body2.matrix);
    body3.matrix.translate(0.55, 0.075, 0.07);
    body3.matrix.scale(1.2, 0.85, 0.85);
    body3.matrix.rotate(g_tailAngle3, 0, 1, 0);
    body2.matrix.translate(0.0, 0.0, -0.5);
    body3.render();
    
    var body3Belly = new Cube();
    body3Belly.color = bellyColor;
    body3Belly.matrix = new Matrix4(body3.matrix);
    body3Belly.matrix.translate(0.001, -0.001, -0.001);
    body3Belly.matrix.scale(1.01, 0.35, 1.01);
    body3Belly.render();
    
    var body3Stripe = new Cube();
    body3Stripe.color = stripeColor;
    body3Stripe.matrix = new Matrix4(body3.matrix);
    body3Stripe.matrix.translate(-0.001, 0.35, -0.001);
    body3Stripe.matrix.scale(1.01, 0.4, 1.01);
    body3Stripe.render();
    
    var body4 = new Cube();
    body4.color = bodyColor;
    body4.matrix = new Matrix4(body3.matrix);
    body4.matrix.translate(0.7, 0.15, 0.15);
    body4.matrix.scale(0.8, 0.7, 0.7);
    body4.matrix.rotate(g_tailAngle4, 0, 1, 0);
    body2.matrix.translate(0.0, 0.0, -0.5);
    body4.render();
    
    var body4Belly = new Cube();
    body4Belly.color = bellyColor;
    body4Belly.matrix = new Matrix4(body4.matrix);
    body4Belly.matrix.translate(0.001, -0.001, -0.001);
    body4Belly.matrix.scale(1.01, 0.35, 1.01);
    body4Belly.render();
    
    var body4Stripe = new Cube();
    body4Stripe.color = stripeColor;
    body4Stripe.matrix = new Matrix4(body4.matrix);
    body4Stripe.matrix.translate(-0.001, 0.35, -0.001);
    body4Stripe.matrix.scale(1.01, 0.4, 1.01);
    body4Stripe.render();
    
    var body5 = new Cube();
    body5.color = bodyColor;
    body5.matrix = new Matrix4(body4.matrix);
    body5.matrix.translate(0.6, 0.15, 0.15);
    body5.matrix.scale(1.0, 0.7, 0.7);
    body5.matrix.rotate(g_tailAngle5, 0, 1, 0);
    body2.matrix.translate(0.0, 0.0, -0.5);
    body5.render();
    
    var body5Belly = new Cube();
    body5Belly.color = bellyColor;
    body5Belly.matrix = new Matrix4(body5.matrix);
    body5Belly.matrix.translate(0.001, -0.001, -0.001);
    body5Belly.matrix.scale(1.01, 0.35, 1.01);
    body5Belly.render();
    
    var body5Stripe = new Cube();
    body5Stripe.color = stripeColor;
    body5Stripe.matrix = new Matrix4(body5.matrix);
    body5Stripe.matrix.translate(-0.001, 0.35, -0.001);
    body5Stripe.matrix.scale(1.01, 0.4, 1.01);
    body5Stripe.render();
    
    
    
    
    // Front and head
    var head1 = new Cube();
    head1.color = bodyColor;
    head1.matrix.translate(-0.3, -0.325, -0.145);
    head1.matrix.scale(0.2, 0.65, 0.29);
    head1.render();
    
    var head1Belly = new Cube();
    head1Belly.color = bellyColor;
    head1Belly.matrix = new Matrix4(head1.matrix);
    head1Belly.matrix.translate(-0.001, -0.001, -0.001);
    head1Belly.matrix.scale(1.01, 0.35, 1.01);
    head1Belly.render();
    
    var head1Stripe = new Cube();
    head1Stripe.color = stripeColor;
    head1Stripe.matrix = new Matrix4(head1.matrix);
    head1Stripe.matrix.translate(-0.001, 0.35, -0.001);
    head1Stripe.matrix.scale(1.01, 0.4, 1.01);
    head1Stripe.render();
    
    var head2 = new Cube();
    head2.color = bodyColor;
    head2.matrix.translate(-0.5, -0.3, -0.14);
    head2.matrix.scale(0.28, 0.6, 0.28);
    head2.render();
    
    var head2Belly = new Cube();
    head2Belly.color = bellyColor;
    head2Belly.matrix = new Matrix4(head2.matrix);
    head2Belly.matrix.translate(-0.001, -0.001, -0.001);
    head2Belly.matrix.scale(1.01, 0.35, 1.01);
    head2Belly.render();
    
    
    
    
    // Top and bottom jaw pieces
    var jaw1 = new Cube();
    jaw1.color = bodyColor;
    jaw1.matrix.translate(-0.6, -0.05, -0.125);
    jaw1.matrix.scale(0.1, 0.3, 0.25);
    jaw1.render();
    
    var jaw2 = new Cube();
    jaw2.color = bodyColor;
    jaw2.matrix.translate(-0.65, -0.05, -0.1);
    jaw2.matrix.scale(0.05, 0.25, 0.2);
    jaw2.render();
    
    var jaw3 = new Cube();
    jaw3.color = bodyColor;
    jaw3.matrix.translate(-0.7, -0.05, -0.075);
    jaw3.matrix.scale(0.05, 0.2, 0.15);
    jaw3.render();
    
    var bottomJaw = new Cube();
    bottomJaw.color = bellyColor;
    bottomJaw.matrix.translate(-0.45, -0.25, -0.1);
    bottomJaw.matrix.rotate(g_jawAngle, 0, 0, 1);
    bottomJaw.matrix.scale(0.2, 0.1, 0.2);
    bottomJaw.matrix.translate(-1.0, 0.0, 0.0);
    bottomJaw.render();
    
    // Inside of mouth
    var topMouth = new Cube();
    topMouth.color = mouthColor;
    topMouth.matrix.translate(-0.6, -0.051, -0.08);
    topMouth.matrix.scale(0.18, 0.1, 0.16);
    topMouth.render();
    
    var backMouth = new Cube();
    backMouth.color = mouthColor;
    backMouth.matrix.translate(-0.501, -0.25, -0.08);
    backMouth.matrix.scale(0.2, 0.2, 0.16);
    backMouth.render();
    
    var bottomMouth = new Cube();
    bottomMouth.color = mouthColor;
    bottomMouth.matrix.translate(-0.45, -0.249, -0.08);
    bottomMouth.matrix.rotate(g_jawAngle, 0, 0, 1);
    bottomMouth.matrix.scale(0.18, 0.1, 0.16);
    bottomMouth.matrix.translate(-1.0, 0.0, 0.0);
    bottomMouth.render();
    
    
    
    
    // 3 gills on front and back
    var gill1 = new Cube();
    gill1.color = detailColor;
    gill1.matrix.translate(-0.25, -0.2, -0.15);
    gill1.matrix.scale(0.005, 0.15, 0.3);
    gill1.render();
    
    var gill2 = new Cube();
    gill2.color = detailColor;
    gill2.matrix.translate(-0.23, -0.2, -0.15);
    gill2.matrix.scale(0.005, 0.15, 0.3);
    gill2.render();
    
    var gill3 = new Cube();
    gill3.color = detailColor;
    gill3.matrix.translate(-0.21, -0.2, -0.15);
    gill3.matrix.scale(0.005, 0.15, 0.3);
    gill3.render();
    
    
    
    
    // Eyes on front and back
    var eye = new Cube();
    eye.color = detailColor
    eye.matrix.translate(-0.4, 0.0, -0.16);
    eye.matrix.scale(0.05, 0.1, 0.32);
    eye.render();
    
    var iris = new Cube();
    iris.color = [0.0, 0.0, 0.0, 1.0];
    iris.matrix.translate(-0.395, 0.005, -0.165);
    iris.matrix.scale(0.04, 0.08, 0.33);
    iris.render();
    
    var eyebrow = new Cube();
    eyebrow.color = [0.0, 0.0, 0.0, 1.0];
    eyebrow.matrix.translate(-0.45, 0.1, -(g_eyebrowWidth / 2));
    eyebrow.matrix.rotate(-45, 0, 0, 1);
    eyebrow.matrix.scale(0.01, 0.15, g_eyebrowWidth);
    eyebrow.render();
    
    
    
    
    // Top, bottom, and back fins
    var fin1 = new Cube();
    fin1.color = finColor;
    fin1.matrix = new Matrix4(body.matrix);
    fin1.matrix.translate(0.4, 0.7, 0.45);
    fin1.matrix.rotate(45, 0, 0, 1);
    fin1.matrix.scale(0.5, 0.4, 0.1);
    fin1.render();
        
    var fin1Stripe1 = new Cube();
    fin1Stripe1.color = detailColor;
    fin1Stripe1.matrix = new Matrix4(fin1.matrix);
    fin1Stripe1.matrix.translate(0.01, 0.25, -0.01);
    fin1Stripe1.matrix.scale(1.0, 0.1, 1.1);
    fin1Stripe1.render();
    
    var fin1Stripe2 = new Cube();
    fin1Stripe2.color = detailColor;
    fin1Stripe2.matrix = new Matrix4(fin1.matrix);
    fin1Stripe2.matrix.translate(0.01, 0.65, -0.01);
    fin1Stripe2.matrix.scale(1.0, 0.1, 1.1);
    fin1Stripe2.render();
    
    var fin2 = new Cube();
    fin2.color = finColor;
    fin2.matrix = new Matrix4(body.matrix);
    fin2.matrix.translate(0.0, 0.08, 0.2);
    fin2.matrix.rotate(-45, 0, 0, 1);
    fin2.matrix.scale(0.35, 0.2, 0.1);
    fin2.render();
        
    var fin2Stripe1 = new Cube();
    fin2Stripe1.color = detailColor;
    fin2Stripe1.matrix = new Matrix4(fin2.matrix);
    fin2Stripe1.matrix.translate(0.01, 0.25, -0.01);
    fin2Stripe1.matrix.scale(1.0, 0.1, 1.1);
    fin2Stripe1.render();
    
    var fin2Stripe2 = new Cube();
    fin2Stripe2.color = detailColor;
    fin2Stripe2.matrix = new Matrix4(fin2.matrix);
    fin2Stripe2.matrix.translate(0.01, 0.65, -0.01);
    fin2Stripe2.matrix.scale(1.0, 0.1, 1.1);
    fin2Stripe2.render();
    
    var fin3 = new Cube();
    fin3.color = finColor;
    fin3.matrix = new Matrix4(fin2.matrix);
    fin3.matrix.translate(0.0, 0.0, 5.0);
    fin3.render();
        
    var fin3Stripe1 = new Cube();
    fin3Stripe1.color = detailColor;
    fin3Stripe1.matrix = new Matrix4(fin3.matrix);
    fin3Stripe1.matrix.translate(0.01, 0.25, -0.01);
    fin3Stripe1.matrix.scale(1.0, 0.1, 1.1);
    fin3Stripe1.render();
        
    var fin3Stripe2 = new Cube();
    fin3Stripe2.color = detailColor;
    fin3Stripe2.matrix = new Matrix4(fin3.matrix);
    fin3Stripe2.matrix.translate(0.01, 0.65, -0.01);
    fin3Stripe2.matrix.scale(1.0, 0.1, 1.1);
    fin3Stripe2.render();
    
    var fin4 = new Cube();
    fin4.color = finColor;
    fin4.matrix = new Matrix4(body3.matrix);
    fin4.matrix.translate(0.5, 0.08, 0.2);
    fin4.matrix.rotate(-45, 0, 0, 1);
    fin4.matrix.scale(0.35, 0.2, 0.1);
    fin4.render();
            
    var fin4Stripe1 = new Cube();
    fin4Stripe1.color = detailColor;
    fin4Stripe1.matrix = new Matrix4(fin4.matrix);
    fin4Stripe1.matrix.translate(0.01, 0.25, -0.01);
    fin4Stripe1.matrix.scale(1.0, 0.1, 1.1);
    fin4Stripe1.render();
        
    var fin4Stripe2 = new Cube();
    fin4Stripe2.color = detailColor;
    fin4Stripe2.matrix = new Matrix4(fin4.matrix);
    fin4Stripe2.matrix.translate(0.01, 0.65, -0.01);
    fin4Stripe2.matrix.scale(1.0, 0.1, 1.1);
    fin4Stripe2.render();
        
    var fin5 = new Cube();
    fin5.color = finColor;
    fin5.matrix = new Matrix4(body3.matrix);
    fin5.matrix.translate(0.5, 0.08, 0.75);
    fin5.matrix.rotate(-45, 0, 0, 1);
    fin5.matrix.scale(0.35, 0.2, 0.1);
    fin5.render();
                
    var fin5Stripe1 = new Cube();
    fin5Stripe1.color = detailColor;
    fin5Stripe1.matrix = new Matrix4(fin5.matrix);
    fin5Stripe1.matrix.translate(0.01, 0.25, -0.01);
    fin5Stripe1.matrix.scale(1.0, 0.1, 1.1);
    fin5Stripe1.render();
            
    var fin5Stripe2 = new Cube();
    fin5Stripe2.color = detailColor;
    fin5Stripe2.matrix = new Matrix4(fin5.matrix);
    fin5Stripe2.matrix.translate(0.01, 0.65, -0.01);
    fin5Stripe2.matrix.scale(1.0, 0.1, 1.1);
    fin5Stripe2.render();
        
    var fin6 = new Cube();
    fin6.color = finColor;
    fin6.matrix.translate(-0.35, -0.2, -0.12);
    fin6.matrix.rotate(g_finx - 60, 1, 0, 0);
    fin6.matrix.rotate(g_finy - 240, 0, 1, 0);
    fin6.matrix.scale(0.1, 0.01, 0.1)
    fin6.render();
        
    var fin6Detail = new Cube();
    fin6Detail.color = detailColor;
    fin6Detail.matrix = new Matrix4(fin6.matrix);
    fin6Detail.matrix.translate(0.001, -0.001, 0.001)
    fin6Detail.matrix.scale(0.5, 1.01, 0.5);
    fin6Detail.render();
    
    var fin7 = new Cube();
    fin7.color = finColor;
    fin7.matrix.translate(-0.35, -0.2, 0.12);
    fin7.matrix.rotate(-g_finx + 60, 1, 0, 0);
    fin7.matrix.rotate(-g_finy - 30, 0, 1, 0);
    fin7.matrix.scale(0.1, 0.01, 0.1);
    fin7.render();
        
    var fin7Detail = new Cube();
    fin7Detail.color = detailColor;
    fin7Detail.matrix = new Matrix4(fin7.matrix);
    fin7Detail.matrix.translate(0.001, -0.001, -0.001)
    fin7Detail.matrix.scale(0.5, 1.01, 0.5);
    fin7Detail.render();
        
        
        
        
    // The back fins and stripes
    var backFin1 = new Cube();
    backFin1.color = finColor;
    backFin1.matrix = new Matrix4(body5.matrix);
    backFin1.matrix.translate(1.4, 0.55, 0.35);
    backFin1.matrix.rotate(45, 0, 0, 1);
    backFin1.matrix.scale(0.9, 0.7, 0.2);
    backFin1.matrix.translate(-0.5, 0.0, 0.0);
    backFin1.render();
        
    var backFin1Stripe1 = new Cube();
    backFin1Stripe1.color = detailColor;
    backFin1Stripe1.matrix = new Matrix4(backFin1.matrix);
    backFin1Stripe1.matrix.translate(0.01, 0.15, -0.01);
    backFin1Stripe1.matrix.scale(1.0, 0.1, 1.1);
    backFin1Stripe1.render();
            
    var backFin1Stripe2 = new Cube();
    backFin1Stripe2.color = detailColor;
    backFin1Stripe2.matrix = new Matrix4(backFin1.matrix);
    backFin1Stripe2.matrix.translate(0.01, 0.35, -0.01);
    backFin1Stripe2.matrix.scale(1.0, 0.1, 1.1);
    backFin1Stripe2.render();
        
    var backFin1Stripe3 = new Cube();
    backFin1Stripe3.color = detailColor;
    backFin1Stripe3.matrix = new Matrix4(backFin1.matrix);
    backFin1Stripe3.matrix.translate(0.01, 0.55, -0.01);
    backFin1Stripe3.matrix.scale(1.0, 0.1, 1.1);
    backFin1Stripe3.render();
                
    var backFin1Stripe4 = new Cube();
    backFin1Stripe4.color = detailColor;
    backFin1Stripe4.matrix = new Matrix4(backFin1.matrix);
    backFin1Stripe4.matrix.translate(0.01, 0.75, -0.01);
    backFin1Stripe4.matrix.scale(1.0, 0.1, 1.1);
    backFin1Stripe4.render();
    
    var backFin1Top = new Cube();
    backFin1Top.color = finColor;
    backFin1Top.matrix = new Matrix4(backFin1.matrix);
    backFin1Top.matrix.translate(1.0, 0.25, 0.25);
    backFin1Top.matrix.scale(0.5, 0.5, 0.5);
    backFin1Top.render();
        
    var backFin1TopStripe1 = new Cube();
    backFin1TopStripe1.color = detailColor;
    backFin1TopStripe1.matrix = new Matrix4(backFin1Top.matrix);
    backFin1TopStripe1.matrix.translate(0.01, 0.18, -0.01);
    backFin1TopStripe1.matrix.scale(1.0, 0.2, 1.1);
    backFin1TopStripe1.render();
                
    var backFin1TopStripe2 = new Cube();
    backFin1TopStripe2.color = detailColor;
    backFin1TopStripe2.matrix = new Matrix4(backFin1Top.matrix);
    backFin1TopStripe2.matrix.translate(0.01, 0.58, -0.01);
    backFin1TopStripe2.matrix.scale(1.0, 0.2, 1.1);
    backFin1TopStripe2.render();
    
    var backFin2 = new Cube();
    backFin2.color = finColor;
    backFin2.matrix = new Matrix4(body5.matrix);
    backFin2.matrix.translate(1.0, 0.0, 0.35);
    backFin2.matrix.rotate(-35, 0, 0, 1);
    backFin2.matrix.scale(0.8, 0.5, 0.2);
    backFin2.matrix.translate(-0.5, 0.0, 0.0);
    backFin2.render();
        
    var backFin2Stripe1 = new Cube();
    backFin2Stripe1.color = detailColor;
    backFin2Stripe1.matrix = new Matrix4(backFin2.matrix);
    backFin2Stripe1.matrix.translate(0.01, 0.15, -0.01);
    backFin2Stripe1.matrix.scale(1.0, 0.1, 1.1);
    backFin2Stripe1.render();
                
    var backFin2Stripe2 = new Cube();
    backFin2Stripe2.color = detailColor;
    backFin2Stripe2.matrix = new Matrix4(backFin2.matrix);
    backFin2Stripe2.matrix.translate(0.01, 0.35, -0.01);
    backFin2Stripe2.matrix.scale(1.0, 0.1, 1.1);
    backFin2Stripe2.render();
            
    var backFin2Stripe3 = new Cube();
    backFin2Stripe3.color = detailColor;
    backFin2Stripe3.matrix = new Matrix4(backFin2.matrix);
    backFin2Stripe3.matrix.translate(0.01, 0.55, -0.01);
    backFin2Stripe3.matrix.scale(1.0, 0.1, 1.1);
    backFin2Stripe3.render();
                    
    var backFin2Stripe4 = new Cube();
    backFin2Stripe4.color = detailColor;
    backFin2Stripe4.matrix = new Matrix4(backFin2.matrix);
    backFin2Stripe4.matrix.translate(0.01, 0.75, -0.01);
    backFin2Stripe4.matrix.scale(1.0, 0.1, 1.1);
    backFin2Stripe4.render();
    
    var backFin2Top = new Cube();
    backFin2Top.color = finColor;
    backFin2Top.matrix = new Matrix4(backFin2.matrix);
    backFin2Top.matrix.translate(0.85, 0.25, 0.25);
    backFin2Top.matrix.scale(0.5, 0.5, 0.5);
    backFin2Top.render();
        
    var backFin2TopStripe1 = new Cube();
    backFin2TopStripe1.color = detailColor;
    backFin2TopStripe1.matrix = new Matrix4(backFin2Top.matrix);
    backFin2TopStripe1.matrix.translate(0.01, 0.18, -0.01);
    backFin2TopStripe1.matrix.scale(1.0, 0.2, 1.1);
    backFin2TopStripe1.render();
                    
    var backFin2TopStripe2 = new Cube();
    backFin2TopStripe2.color = detailColor;
    backFin2TopStripe2.matrix = new Matrix4(backFin2Top.matrix);
    backFin2TopStripe2.matrix.translate(0.01, 0.58, -0.01);
    backFin2TopStripe2.matrix.scale(1.0, 0.2, 1.1);
    backFin2TopStripe2.render();
    
    
    
    // Little fish to get eaten
    var littleBody = new Cube();
    littleBody.color = littleFishColor;
    littleBody.matrix.translate(-g_littleFishLocation, -0.2, 0.0);
    littleBody.matrix.scale(0.1, 0.15, 0.1);
    littleBody.render();
    
    var littleBody2 = new Cube();
    littleBody2.color = littleFishColor;
    littleBody2.matrix = new Matrix4(littleBody.matrix);
    littleBody2.matrix.translate(1.0, 0.25, 0.25);
    littleBody2.matrix.scale(0.5, 0.5, 0.5);
    littleBody2.render();
    
    var littleFin1 = new Cube();
    littleFin1.color = littleFishColor;
    littleFin1.matrix = new Matrix4(littleBody2.matrix);
    littleFin1.matrix.translate(1.2, 0.2, 0.5);
    littleFin1.matrix.rotate(45, 0, 0, 1);
    littleFin1.matrix.scale(1.2, 1.0, 0.1);
    littleFin1.matrix.translate(0.0, 0.0, -0.5);
    littleFin1.render();
    
    var littleFin2 = new Cube();
    littleFin2.color = littleFishColor;
    littleFin2.matrix = new Matrix4(littleBody2.matrix);
    littleFin2.matrix.translate(0.6, 0.1, 0.5);
    littleFin2.matrix.rotate(-45, 0, 0, 1);
    littleFin2.matrix.scale(1.2, 1.0, 0.1);
    littleFin2.matrix.translate(0.0, 0.0, -0.5);
    littleFin2.render();
    
    var littleEye = new Cube();
    littleEye.color = [1.0, 1.0, 1.0, 1.0];
    littleEye.matrix = new Matrix4(littleBody.matrix);
    littleEye.matrix.translate(0.1, 0.45, -0.001);
    littleEye.matrix.scale(0.5, 0.5, 1.002);
    littleEye.render();
    
    var littleIris = new Cube();
    littleIris.color = [0.0, 0.0, 0.0, 1.0];
    littleIris.matrix = new Matrix4(littleBody.matrix);
    littleIris.matrix.translate(0.4, 0.7, -0.0011);
    littleIris.matrix.scale(0.1, 0.1, 1.02);
    littleIris.render();

    
        
    // Check time at the end of the function and display
    var duration = performance.now() - startTime;
    sendTextToHTML((" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)), "fps");
}
         
function sendTextToHTML(text, htmlID) {
        var element = document.getElementById(htmlID);
        if (!element) {
            console.log("Failed to get element from HTML");
            return;
        }
        element.innerHTML = text;
}

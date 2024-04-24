// Defines the cube class
class Cube {
    
    // Constructor
    constructor() {
        this.type='cube';
        this.color = [1.0, 0.0, 0.0, 1.0];
        this.matrix = new Matrix4();
    }
    
    // Render this shape
    render() {
        var rgba = this.color;
        
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Front of cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D([0.0,0.0,0.0,    1.0,1.0,0.0,    1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0,    0.0,1.0,0.0,    1.0,1.0,0.0]);
        
        // Back of cube
        drawTriangle3D([0.0,0.0,1.0,    1.0,1.0,1.0,    1.0,0.0,1.0]);
        drawTriangle3D([0.0,0.0,1.0,    0.0,1.0,1.0,    1.0,1.0,1.0]);
        
        // Top of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0.0,1.0,0.0,    0.0,1.0,1.0,    1.0,1.0,1.0]);
        drawTriangle3D([0.0,1.0,0.0,    1.0,1.0,1.0,    1.0,1.0,0.0]);
        
        // Bottom of cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangle3D([0.0,0.0,0.0,    1.0,0.0,1.0,    1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0,    0.0,0.0,1.0,    1.0,0.0,1.0]);
        
        // Right side of cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3D([1.0,1.0,0.0,    1.0,0.0,1.0,    1.0,0.0,0.0]);
        drawTriangle3D([1.0,1.0,0.0,    1.0,1.0,1.0,    1.0,0.0,1.0]);
        
        // Left side of cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3D([0.0,1.0,0.0,    0.0,0.0,1.0,    0.0,0.0,0.0]);
        drawTriangle3D([0.0,1.0,0.0,    0.0,1.0,1.0,    0.0,0.0,1.0]);
    }
}


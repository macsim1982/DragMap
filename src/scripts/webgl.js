import vertex from './shaders/vertex.js';
import frag from './shaders/fragment.js';
import { mat4 } from 'gl-matrix';

class rgba {
    constructor(r, g, b, a) {
        return [r, g, b, a];
    }
}

class WebGL {
    constructor(options) {
        this.options = options;
        this.canvas = document.querySelector(options.canvasSelector);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Initialize WebGL context
        this.initialize(options);

        this.addEvents();
    }
    addEvents() {
        window.addEventListener('resize', this.onResize.bind(this), false);
    }
    removeEvents() {
        window.removeEventListener('resize', this.onResize.unbind(this), false);
    }
    onResize(e) {
        e.preventDefault();

        console.log(e.type, e.currentTarget);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.initialize(this.options);
    }

    initialize(options) {
        this.gl = this.canvas.getContext("webgl");
        this.setBackground(options.bgColor || new rgba(0, 0, 0, 0.5));

        const shaderProgram = this.initShaderProgram(this.gl, vertex, frag);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            }
        };


        this.buffers = this.initBuffers(this.gl);

        window.requestAnimationFrame(this.frame.bind(this));
    }

    frame(now) {
        this.draw(this.gl, this.programInfo, this.buffers);

        window.requestAnimationFrame(this.frame.bind(this));
    }

    setBackground(bg) {
        if (!this.gl) {
            console.warn("Impossible d'initialiser WebGL. Votre navigateur ou votre machine peut ne pas le supporter.");
            return;
        }

        this.gl.clearColor(...bg);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.warn('Impossible d\'initialiser le programme shader : ' + gl.getProgramInfoLog(shaderProgram));
        return null;
        }

        return shaderProgram;
    }

    loadShader(gl, type, source) {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);

        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initBuffers(gl) {

        const positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

        return {
            position: positionBuffer,
        };
    }

    draw(gl, programInfo, buffers) {
        gl.useProgram(programInfo.program);
        let uColor = gl.getUniformLocation(programInfo.program, "uColor");
        gl.uniform4fv(uColor, [Math.sin(Date.now() / 100) * 0.05, 0.14 + Math.sin(Date.now() / 60) * 0.05, 0.3 + Math.sin(Date.now() / 30) * 0.05, 0.3]);  // offset it to the right half the screen
        gl.clearColor(...this.options.bgColor);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

       

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        mat4.translate(
            modelViewMatrix,     // destination matrix
            modelViewMatrix,     // matrix to translate
            [-0.0, 0.0, -6.0]    // amount to translate
        );

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }

        programInfo.matrix = programInfo.matrix || {};
        programInfo.matrix.projectionMatrix = projectionMatrix;
        programInfo.matrix.modelViewMatrix = modelViewMatrix;

        // console.log('programInfo', programInfo);
    }



}

export default WebGL;
/**
 * Programa usando WegGL para demonstrar a biblioteca objetos.js.
 * 
 * Você pode usar essa biblioteca na sua solução do EP3.
 */

"use strict";

// ==================================================================
// constantes globais


// ==================================================================
// variáveis globais
// as strings com os código dos shaders também são globais, estão 
// no final do arquivo.

var gl;        // webgl2
var gCanvas;   // canvas

function Cena() {
    // buffers da cena combinam os buffers dos objetos
    this.bPos = [];
    this.bNorm = [];
    this.bCor = [];

    this.objs = [];
    this.fundo = new FundoDoMar(FUNDO.cor, FUNDO.alfa);
    this.bola = new Esfera(BOLA.cor, BOLA.alfa);

    this.init = function () {
        // prepara e insere o fundo
        let f = this.fundo;
        f.init(FUNDO.ndivs, FUNDO.solido);  // no config.js
        f.escala = FUNDO.escala;
        f.bufPos = this.bPos.length;  // no começo é zero
        this.bPos = this.bPos.concat( f.bPos );
        this.bNorm = this.bNorm.concat( f.bNorm );
        this.bCor = this.bCor.concat( f.bCor );
        this.objs.push(f);

        // prepara e insere uma bola
        let b = this.bola;
        b.init(BOLA.ndivs, BOLA.solido);
        b.escala = BOLA.escala;
        b.pos    = BOLA.pos;
        b.bufPos = this.bPos.length;  // posição no buffer
        this.bPos = this.bPos.concat( b.bPos );
        this.bNorm = this.bNorm.concat( b.bNorm );
        this.bCor = this.bCor.concat( b.bCor );
        this.objs.push(b);

        this.np = this.bPos.length;
        console.log("Cena vertices: ", this.np);
    };    
};

var gCena = new Cena();
gCena.init();  // cria objetos e buffers

// guarda coisas do shader
var gShader = {
    program : null,
};

// guarda coisas da interface e contexto do programa
var gCtx = {
    view : mat4(),     // view matrix, inicialmente identidade
    perspective : mat4(), // projection matrix
};

// ==================================================================
// chama a main quando terminar de carregar a janela
window.onload = main;

/**
 * programa principal.
 */
function main()
{
    // ambiente
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    if (!gl) alert( "Vixe! Não achei WebGL 2.0 aqui :-(" );

    console.log("Canvas: ", gCanvas.width, gCanvas.height);

    // Inicializações feitas apenas 1 vez
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clearColor(COR_CLEAR[0], COR_CLEAR[1], COR_CLEAR[2], COR_CLEAR[3]);
    gl.enable(gl.DEPTH_TEST);

    // shaders
    crieShaders();

    // finalmente...
    render();
}

// ==================================================================
/**
 * cria e configura os shaders
 */
function crieShaders() {
    //  cria o programa
    gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
    gl.useProgram(gShader.program);
    
    // buffer das normais
    var bufNormais = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufNormais );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gCena.bNorm), gl.STATIC_DRAW);

    var aNormal = gl.getAttribLocation(gShader.program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    // buffer dos vértices
    var bufVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gCena.bPos), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(gShader.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition); 

    // buffer das cores
    var bufCores = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gCena.bCor), gl.STATIC_DRAW);

    var aCor = gl.getAttribLocation(gShader.program, "aCor");
    gl.vertexAttribPointer(aCor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aCor); 
    
    // resolve os uniforms
    gShader.uModel   = gl.getUniformLocation(gShader.program, "uModel");
    gShader.uView   = gl.getUniformLocation(gShader.program, "uView");
    gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");
    gShader.uInverseTranspose = gl.getUniformLocation(gShader.program, "uInverseTranspose");

    // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
    // que é feita apenas 1 vez
    gCtx.perspective = perspective( CAM.fovy, CAM.aspect, CAM.near, CAM.far);
    gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspective));
    
    gCtx.view = lookAt( CAM.eye, CAM.at, CAM.up);
    gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));

    // parametros para iluminação
    gShader.uLuzPos = gl.getUniformLocation(gShader.program, "uLuzPos");
    gl.uniform4fv( gShader.uLuzPos, LUZ.pos);

    // fragment shader
    gShader.uLuzAmb = gl.getUniformLocation(gShader.program, "uLuzAmbiente");
    gShader.uLuzDif = gl.getUniformLocation(gShader.program, "uLuzDifusao");
    gShader.uLuzEsp = gl.getUniformLocation(gShader.program, "uLuzEspecular");

    gl.uniform4fv( gShader.uLuzAmb, LUZ.amb );
    gl.uniform4fv( gShader.uLuzDif, LUZ.dif );
    gl.uniform4fv( gShader.uLuzEsp, LUZ.esp );

};

// ==================================================================
/**
 * Usa o shader para desenhar.
 * Assume que os dados já foram carregados e são estáticos.
 */
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // modelo muda a cada frame da animação
    if(gCena.rodando) gCena.theta[gCena.axis] += 2.0;


    for (let obj of gCena.objs ) {
        var model = mat4();  // identidade
        // escala os eixos
        model[0][0] *= obj.escala[0];
        model[1][1] *= obj.escala[1];
        model[2][2] *= obj.escala[2];

        let rx = rotateX(obj.theta[0]);
        model = mult(rx, model);
        let ry = rotateX(obj.theta[1]);
        model = mult(ry, model);
        let rz = rotateX(obj.theta[2]);
        model = mult(rz, model);
        // translação
        model[0][3] = obj.pos[0];
        model[1][3] = obj.pos[1];
        model[2][3] = obj.pos[2];
    
        let modelView = mult(gCtx.view, model);
        let modelViewInv = inverse(modelView);
        let modelViewInvTrans = transpose(modelViewInv);
    
        gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
        gl.uniformMatrix4fv(gShader.uInverseTranspose, false, flatten(modelViewInvTrans));
    
        gl.drawArrays(gl.TRIANGLES, obj.bufPos, obj.np);
    
    };

};


// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

var gVertexShaderSrc = `#version 300 es

in vec3 aPosition;
in vec3 aNormal;
in vec4 aCor;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uInverseTranspose;

uniform vec4 uLuzPos;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;
out vec4 vCor;

void main() {
    vec4 aPos4 = vec4(aPosition, 1);
    mat4 modelView = uView * uModel;
    gl_Position = uPerspective * modelView * aPos4;

    // orienta as normais como vistas pela câmera
    vNormal = mat3(uInverseTranspose) * aNormal;
    vec4 pos = modelView * aPos4;

    vLight = (uView * uLuzPos - pos).xyz;
    vView = -(pos.xyz);

    vCor = aCor;
}
`;

var gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;
in vec4 vCor;
out vec4 corSaida;

// cor = produto luz * material
uniform vec4 uLuzAmbiente;
uniform vec4 uLuzDifusao;
uniform vec4 uLuzEspecular;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);
    vec3 viewV = normalize(vView);
    vec3 halfV = normalize(lightV + viewV);
  
    // ambiente
    vec4 ambiente = uLuzAmbiente * vCor;

    // difusao
    float kd = max(0.0, dot(normalV, lightV) );
    vec4 difusao = kd * uLuzDifusao * vCor;

    // especular
    float alfa = vCor.a;
    float ks = pow( max(0.0, dot(normalV, halfV)), alfa);
    vec4 especular = ks * uLuzEspecular;

    corSaida = difusao + especular + ambiente; 
    corSaida.a = 1.0;
}
`;


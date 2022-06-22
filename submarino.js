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

var ultimoT = Date.now(); // delta

// variáveis de controle
var decrementa = false;
var incrementa = false;

// eixo de rotação alterado
var eixo = 0;

function Cena() {
    // buffers da cena combinam os buffers dos objetos
    this.bPos = [];
    this.bNorm = [];
    this.bCor = [];

    this.objs = [];
    this.fundo = new FundoDoMar(FUNDO.cor, FUNDO.alfa);
    this.bola = new Esfera(BOLA.cor, BOLA.alfa);
    this.bola2 = new Esfera(BOLA2.cor, BOLA2.alfa);
    this.bola3 = new Esfera(BOLA3.cor, BOLA3.alfa);
    this.cubo1 = new Cubo(CUBO1.cor, CUBO1.alfa);
    this.cubo2 = new Cubo(CUBO2.cor, CUBO2.alfa);
    //this.bola.changePos(vec3(1,0,0));

    // inserido no programa base
    this.rodando = true;
    this.passo = false;
    this.theta = vec3(1,1,0);

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
        b.theta = vec3(1, 0, 0); // added
        b.bufPos = this.bPos.length;  // posição no buffer
        this.bPos = this.bPos.concat( b.bPos );
        this.bNorm = this.bNorm.concat( b.bNorm );
        this.bCor = this.bCor.concat( b.bCor );
        this.objs.push(b);

        /* new new new */
        let b2 = this.bola2;
        b2.init(BOLA2.ndivs, BOLA2.solido);
        b2.escala = BOLA2.escala;
        b2.pos    = BOLA2.pos;
        b2.bufPos = this.bPos.length;  // posição no buffer
        this.bPos = this.bPos.concat( b2.bPos );
        this.bNorm = this.bNorm.concat( b2.bNorm );
        this.bCor = this.bCor.concat( b2.bCor );
        this.objs.push(b2);

        let b3 = this.bola3;
        b3.init(BOLA3.ndivs, BOLA3.solido);
        b3.escala = BOLA3.escala;
        b3.pos    = BOLA3.pos;
        b3.bufPos = this.bPos.length;  // posição no buffer
        this.bPos = this.bPos.concat( b3.bPos );
        this.bNorm = this.bNorm.concat( b3.bNorm );
        this.bCor = this.bCor.concat( b3.bCor );
        this.objs.push(b3);

        let c1 = this.cubo1;
        c1.init();  // no config.js
        c1.escala = CUBO1.escala;
        c1.pos    = CUBO1.pos;
        c1.bufPos = this.bPos.length;  // no começo é zero
        this.bPos = this.bPos.concat( c1.bPos );
        this.bNorm = this.bNorm.concat( c1.bNorm );
        this.bCor = this.bCor.concat( c1.bCor );
        this.objs.push(c1);

        let c2 = this.cubo2;
        c2.init();  // no config.js
        c2.escala = CUBO2.escala;
        c2.pos    = CUBO2.pos;
        c2.bufPos = this.bPos.length;  // no começo é zero
        this.bPos = this.bPos.concat( c2.bPos );
        this.bNorm = this.bNorm.concat( c2.bNorm );
        this.bCor = this.bCor.concat( c2.bCor );
        this.objs.push(c2);
        /* new new new */

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
// cria interface de botões na página
function crieInterface() {
    // inicialização 
    document.getElementById("passo").disabled = gCena.rodando;
    
    // interface
    document.getElementById("play").onclick = function() {
        gCena.rodando = !gCena.rodando;
        document.getElementById("passo").disabled = gCena.rodando;
    };

    document.getElementById("passo").onclick = function() {
        if(!gCena.rodando) {
            console.log("passo");
            gCena.passo = true;
            render();
        }
    };
}


// controle do submarino pelo teclado
function callbackKeyUp(e) {
    const keyName = e.key.toUpperCase();
    console.log(keyName);

    switch (keyName) {
        case 'K':
            console.log('Pause Sub');
            gCena.vTrans = 0;
            break;
        case 'L':
            console.log('decrementa velocidade');
                gCena.vTrans--;
            break;
        case 'J':
            console.log('incrementa velocidade');
                gCena.vTrans++;
            break;
        case 'W':
            console.log('incrementa pitch');
            incrementa =  true;
            eixo = 0;
            break;
        case 'X':
            console.log('decrementa pitch');
            decrementa = true;
            eixo = 0;
            break;
        case 'A':
            console.log('incrementa yaw');
            incrementa =  true;
            eixo = 1;
            break;
        case 'D':
            console.log('decrementa yaw');
            decrementa = true;
            eixo = 1;
            break;
        case 'Z':
            console.log('incrementa row');
            incrementa =  true;
            eixo = 2;
            break;
        case 'C':
            console.log('decrementa row');
            decrementa = true;
            eixo = 2;
            break;
    }

}


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

    // Inicialização da posição do submarino
    gCena.vz = normalize(subtract(CAM.at, CAM.eye));
    gCena.vx = normalize(cross(gCena.vz, CAM.up));
    gCena.vy = normalize(cross(gCena.vx, gCena.vz));
    gCena.pos = CAM.eye;
    gCena.theta = vec3(0,0,0);
    gCena.vTrans = 0;

    console.log(gCena.vz, gCena.vx, gCena.vy);

    // shaders
    crieShaders();

    // interface
    crieInterface();
    window.onkeyup = callbackKeyUp;

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
let eye = CAM.eye;
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let now = Date.now();    
    let delta = (now - ultimoT)/1000;

    // modelo muda a cada frame da animação
    if(gCena.rodando || gCena.passo) { 

        // mudança na rotação
        if(incrementa) {
            gCena.theta[eixo]++;
            incrementa = false;
        }
        else if(decrementa) {
            gCena.theta[eixo]--;
            decrementa = false;
        }

        let c_model = mat4();

        let crx = rotateX(gCena.theta[0]);
        c_model = mult(crx, c_model);
        let cry = rotateY(gCena.theta[1]);
        c_model = mult(cry, c_model);
        let crz = rotateZ(gCena.theta[2]);
        c_model = mult(crz, c_model);

        // mudança de velocidade

        if (gCena.vTrans != 0) {
            gCena.pos = add(gCena.pos, mult(gCena.vTrans*delta, negate(gCena.vz)));
        }

        // atualiza view
        let new_eye = gCena.pos;
        let new_at = add(gCena.pos, gCena.vz);
        let new_up  = gCena.vy;

        gCtx.view = lookAt( new_eye, new_at, new_up);
        gCtx.view = mult(gCtx.view, c_model);

        gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));

        if(gCena.passo) {
            gCena.passo = false;
        }
    }

    ultimoT = now;

    for (let obj of gCena.objs ) {
        var model = mat4();  // identidade
        // escala os eixos
        model[0][0] *= obj.escala[0];
        model[1][1] *= obj.escala[1];
        model[2][2] *= obj.escala[2];

        //obj.theta = gCena.theta;

        // rotaciona
        let rx = rotateX(obj.theta[0]);
        model = mult(rx, model);
        let ry = rotateY(obj.theta[1]);
        model = mult(ry, model);
        let rz = rotateZ(obj.theta[2]);
        model = mult(rz, model);
        //model = mult(rz, mult(rx, ry));

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

    window.requestAnimationFrame(render);

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


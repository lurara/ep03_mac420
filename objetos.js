/**
 * Funções para desenhar objetos que compões uma cena do EP03
 * 
 * FundoDoMar - plano com irregularidades
 * Cubo - dispensa apresentações
 * Esfera - mais um velho objeto conhecido
 * 
 */

// ========================================================
// Geração do modelo de um objeto fundo do mar
// ========================================================

 const FUNDO_CANTOS = [
    vec3( 1.0,  1.0, 0),
    vec3(-1.0,  1.0, 0),
    vec3(-1.0, -1.0, 0),
    vec3( 1.0, -1.0, 0),
];

const FUNDO_COR = vec4(0.0, 0.5, 1.0, 1.0);
const FUNDO_ALFA = 100.0;

function FundoDoMar(cor = FUNDO_COR, alfa = FUNDO_ALFA) {

    this.np = 0;

    // propriedades do material do objeto
    this.cor = cor;
    this.alfa = alfa;
    // posição, orientaão e escala do objeto    
    this.pos = vec3(0,0,0);
    this.theta = vec3(0,0,0);
    this.escala = vec3(1,1,1);

    this.init = function(ndivs = 0, solido = true) {
        this.bPos  = [];
        this.bNorm = [];
        this.bCor  = [];  

        let v = FUNDO_CANTOS;
        dividaQuad(ndivs, this.bPos, this.bNorm, v[0], v[1], v[2], v[3]);

        this.np = this.bPos.length;
        let cor = this.cor;
        cor[3] = this.alfa;
        for (let i = 0; i < this.np/3 ; i++ ) {
            if (!solido) {
                cor = sorteieCorRGBA();
                cor[3] = this.alfa;
            }
            this.bCor.push(cor);
            this.bCor.push(cor);
            this.bCor.push(cor);
        };
        console.log("Plano num vertices: ", this.np);
    };
};

function dividaQuad(ndivs, pos, nor, a, b, c, d) {
    // Cada nível quebra um quad em 4 subquads
    // a, b, c em ordem mão direita
    // caso base
    if (ndivs > 0) {
        let ab = mix( a, b, 0.5);
        let bc = mix( b, c, 0.5);
        let cd = mix( c, d, 0.5);
        let da = mix( d, a, 0.5);
        let m  = mix(ab, cd, 0.5);
        ab[2] = Math.random() / 10 -0.05;
        bc[2] = Math.random() / 10 -0.05;
        cd[2] = Math.random() / 10 -0.05;
        da[2] = Math.random() / 10 -0.05;
        m[2] = Math.random() / 5 -0.1;


        dividaQuad(ndivs-1, pos, nor,  a, ab, m, da);
        dividaQuad(ndivs-1, pos, nor,  b, bc, m, ab);
        dividaQuad(ndivs-1, pos, nor,  c, cd, m, bc);
        dividaQuad(ndivs-1, pos, nor,  d, da, m, cd);
    }
    else {
        quad(pos, nor, a, b, c, d);
    };
};


// ========================================================
// Geração do modelo de um cubo de lado unitário
// ========================================================

const CUBO_CANTOS = [
    vec3(-0.5, -0.5,  0.5),
    vec3(-0.5,  0.5,  0.5),
    vec3( 0.5,  0.5,  0.5),
    vec3( 0.5, -0.5,  0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5,  0.5, -0.5),
    vec3( 0.5,  0.5, -0.5),
    vec3( 0.5, -0.5, -0.5),    
];

const CUBO_COR = vec4(1.0, 0.5, 0.0, 1.0);
const CUBO_ALFA = 20.0;

/**  ................................................................
* Objeto Cubo de lado 1 centrado na origem.
* 
* usa função auxiliar quad(pos, nor, vert, a, b, c, d)
*/
function Cubo(cor = CUBO_COR, alfa = CUBO_ALFA) {
    this.np  = 0;  // número de posições (vértices)
    this.cor = cor
    this.alfa = alfa;
    // posição, orientaão e escala do objeto    
    this.pos = vec3(0,0,0);
    this.theta = vec3(0,0,0);
    this.escala = vec3(1,1,1);

    this.init = function (solido=true) {    // carrega os buffers
        this.bPos = [];  // vetor de posições
        this.bNorm = [];  // vetor de normais
        this.bCor = [];

        let v = CUBO_CANTOS;
        quad(this.bPos, this.bNorm, v[1], v[0], v[3], v[2]);
        quad(this.bPos, this.bNorm, v[2], v[3], v[7], v[6]);
        quad(this.bPos, this.bNorm, v[3], v[0], v[4], v[7]);
        quad(this.bPos, this.bNorm, v[6], v[5], v[1], v[2]);
        quad(this.bPos, this.bNorm, v[4], v[5], v[6], v[7]);
        quad(this.bPos, this.bNorm, v[5], v[4], v[0], v[1]);
        
        this.np = this.bPos.length;
        let c = this.cor;
        for (let i = 0; i < this.np/3 ; i++ ) {

            if (!solido) {
                c = sorteieCorRGBA();
            }
            this.bCor.push(c);
            this.bCor.push(c);
            this.bCor.push(c);
        };
        console.log("Cubo num vertices: ", this.np);
    };
};

/**  ................................................................
* cria triângulos de um quad e os carrega nos arrays
* pos (posições) e nor (normais).  
* @param {*} pos : array de posições a ser carregado
* @param {*} nor : array de normais a ser carregado
* @param {*} a : vertices
* @param {*} b : em ordem anti-horária
* @param {*} c : 
* @param {*} d :
*/
function quad (pos, nor, a, b, c, d) {
    var t1 = subtract(b, a);
    var t2 = subtract(c, b);
    var normal = cross(t1, t2);

    pos.push(a);
    nor.push(normal);
    pos.push(b);
    nor.push(normal);
    pos.push(c);
    nor.push(normal);
    pos.push(a);
    nor.push(normal);
    pos.push(c);
    nor.push(normal);
    pos.push(d);
    nor.push(normal);
};


/* ==================================================================
    Funções para criar uma esfera de raio unitário centrada na origem.
*/

const ESFERA_CANTOS = [
    vec3( 1.0, 0.0, 0.0), // x
    vec3( 0.0, 1.0, 0.0), // y
    vec3( 0.0, 0.0, 1.0), // z
    vec3(-1.0, 0.0, 0.0), // -x
    vec3( 0.0,-1.0, 0.0), // -y
    vec3( 0.0, 0.0,-1.0), // -z
];

const ESFERA_COR = vec4(1.0, 0.5, 0.0, 1.0);
const ESFERA_ESCALA = vec3(1.0, 1.0, 1.0);
const ESFERA_ALFA = 250.0;

function Esfera(cor = ESFERA_COR, alfa = ESFERA_ALFA) {
    this.np  = 0;  
    this.cor = cor;
    this.alfa = alfa;
    // posição, orientaão e escala do objeto    
    this.pos = vec3(0,0,0);
    this.theta = vec3(0,0,0);
    this.escala = vec3(1,1,1);

    this.init = function (ndivs = 0, solido=true) {    // carrega os buffers
        let v = ESFERA_CANTOS;
        this.bPos = [];  // vetor de posições
        this.bNorm = [];  // vetor de normais
        this.bCor = [];  // vetor de cores
        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[0], v[1], v[2]);
        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[0], v[5], v[1]);
        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[0], v[2], v[4]);
        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[0], v[4], v[5]);

        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[3], v[2], v[1]);
        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[3], v[1], v[5]);
        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[3], v[4], v[2]);
        dividaTriangulo(ndivs, this.bPos, this.bNorm, v[3], v[5], v[4]);

        this.np = this.bPos.length;
        let c = this.cor;
        for (let i = 0; i < this.np/3 ; i++ ) {

            if (!solido) {
                c = sorteieCorRGBA();
            }
            this.bCor.push(c);
            this.bCor.push(c);
            this.bCor.push(c);
        };
        console.log("Esfera num vertices: ", this.np);
    };
};

function dividaTriangulo(ndivs, pos, nor, a, b, c) {
    // Cada nível quebra um triângulo em 4 subtriângulos
    // a, b, c em ordem mão direita
    //    c
    // a  b 
    // caso base
    if (ndivs > 0) {
        let ab = mix( a, b, 0.5);
        let bc = mix( b, c, 0.5);
        let ca = mix( c, a, 0.5);

        ab = normalize(ab);  // raio 1
        bc = normalize(bc);
        ca = normalize(ca);

        dividaTriangulo(ndivs-1, pos, nor,  a, ab, ca);
        dividaTriangulo(ndivs-1, pos, nor,  b, bc, ab);
        dividaTriangulo(ndivs-1, pos, nor,  c, ca, bc);
        dividaTriangulo(ndivs-1, pos, nor, ab, bc, ca);
    }
    else {
        let t1 = subtract(b, a);
        let t2 = subtract(c, a);
        let normal = cross(t1, t2);

        pos.push(a);
        nor.push(normal);
        pos.push(b);
        nor.push(normal);
        pos.push(c);
        nor.push(normal);    
    };
};

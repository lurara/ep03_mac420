/* 
    EP3 - Submarino

    arquivo de configuração e dados.
    A câmera está presa no nariz do submarino.
*/
const COR_CLEAR = [0.0, 0.0, 0.6, 1.0];

const CAM = {
    eye    : vec3(0, -250, 150),
    at     : vec3(0, 0, 0),
    up     : vec3(0, 1, 0),
    fovy   : 45.0,
    aspect : 1.0,
    near   : 1,
    far    : 2000,    
};

// Propriedades da fonte de luz
const LUZ = {
    pos : vec4(0.0, 0.0, 500.0, 1.0), // posição
    amb : vec4(0.2, 0.2, 0.2, 1.0), // ambiente
    dif : vec4(0.8, 0.8, 0.8, 1.0), // difusão
    esp : vec4(0.0, 0.7, 0.7, 1.0), // especular
};

// Propriedades dos objetos. 
// Só dois, para mostrar como funciona.

const FUNDO = {
    escala : vec3(300, 300, 20),
    theta  : vec3(0, 0, 0),
    pos    : vec3(0, 0, 0),
    cor    : vec4(0, 0.5, 1.0, 1),
    alfa   : 50.0,
    ndivs  : 5,
    solido : true, 
};

const BOLA = {
    escala : vec3(75, 40, 120),
    theta  : vec3(0, 0, 0),
    pos    : vec3(-50, 85, 0),
    alfa   : 50.0,
    ndivs  : 3,
    solido : false,
};


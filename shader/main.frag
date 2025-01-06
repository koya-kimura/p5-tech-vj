precision mediump float;

varying vec2 vTexCoord;

uniform float u_time;
uniform sampler2D u_mainTex;
uniform sampler2D u_frameTex;

float PI = 3.14159265358979;

float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

mat2 rot(float angle){
    return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

float atan2(float y,float x){
    return x==0.?sign(y)*PI/2.:atan(y,x);
}

vec2 xy2pol(vec2 xy){
    return vec2(atan2(xy.y,xy.x),length(xy));
}

vec2 pol2xy(vec2 pol){
    return pol.y*vec2(cos(pol.x),sin(pol.x));
}

vec2 mosaic(vec2 uv, float n){
    return floor(uv*n)/n;
}

void main(void) {
    vec2 uv = vTexCoord;

    vec2 texuv = uv;
    texuv.x = abs(texuv.x-0.5);

    if(random(vec2(u_time)) > 0.7){
        texuv.y = 0.5;
    }

    texuv*=rot(u_time*0.3);

    if(random(vec2(u_time+0.4792)) > 0.7){
        texuv = mosaic(uv, 100.);
    }

    texuv.x = fract(texuv.x);
    texuv.y = fract(texuv.y);

    vec4 col = texture2D(u_mainTex,texuv) + texture2D(u_frameTex, uv);

    gl_FragColor = col;
}
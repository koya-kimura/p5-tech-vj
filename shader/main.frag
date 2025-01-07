precision highp float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_mainTex;
uniform sampler2D u_frameTex;

float PI = 3.14159265358979;
float TAU = 6.283185306;

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

void main(void){
    vec2 p=vTexCoord;
    
    // p=fract(p*5.);
    
    p=p*2.-1.;
    if(u_resolution.x>u_resolution.y)p.x*=u_resolution.x/u_resolution.y;
    else p.y*=u_resolution.y/u_resolution.x;
    
    p*=rot(u_time*.1);
    
    float l= length(p);
    float a=atan(p.y,p.x);
    float newAngle=mod(a,PI/4.);
    newAngle=min(newAngle,PI/4.-newAngle);
    vec2 uv=vec2(l*cos(newAngle),l*sin(newAngle));
    
    // uv = fract(uv*5.0);

    // uv.y = 0.8;

    // uv.x = vTexCoord.x;
    
    vec4 col= (l > 1.0 ? vec4(0) : texture2D(u_mainTex,uv)) + texture2D(u_frameTex,vTexCoord);

    vec4 debugTexCol = texture2D(u_mainTex, vTexCoord) + texture2D(u_frameTex,vTexCoord);
    
    gl_FragColor=debugTexCol;
}
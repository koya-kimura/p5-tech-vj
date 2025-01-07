precision highp float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;

uniform bool u_monoEnabled;
uniform bool u_invertEnabled;
uniform bool u_posterizationEnabled;

uniform sampler2D u_mainTex;
uniform sampler2D u_frameTex;

float PI = 3.14159265358979;
float TAU = 6.283185306;

float map(float value, float min1, float max1, float min2, float max2){
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

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

vec2 mirror(vec2 uv){
    return vec2(abs(uv.x-0.5),uv.y);
}

vec2 mosaic(vec2 uv, float n){
    return floor(uv*n)/n;
}

vec4 monochrome(vec4 col){
    return vec4(vec3(col.r+col.g+col.b)/3.,col.a);
}

vec4 binary(vec4 col){
    return vec4(floor(col.rgb+0.99),col.a);
}

vec4 invert(vec4 col){
    return vec4((1.)-col.rgb,col.a);
}

vec4 posterization(vec4 col, float n){
    return vec4(floor(col.rgb*n)/n, col.a);
}

vec2 gridUVTransform(vec2 uv,float n){
    uv = (uv - 0.5) * 2.0;
    uv *= 0.8;
    uv = (uv + 1.0) * 0.5;
    // グリッドのセルサイズを計算
    float cellSize=1./n;

    // 現在のグリッドセルのインデックスを計算
    vec2 cellIndex=floor(uv*n);

    // セル内での相対位置を計算 (0-1の範囲)
    vec2 cellUV=fract(uv*n);

    // 各セルごとに少しずつ異なる変形を適用
    float offsetX=map(random(vec2(cellIndex.x)),0.,1.,-.5,.5);
    float offsetY=map(random(vec2(cellIndex.y)),0.,1.,-.5,.5);
    vec2 offset=vec2(offsetX,offsetY);

    // スケール値を計算 (0.8-1.0の範囲)
    float scale=.5+random(vec2(cellIndex.x*3789.4728, cellIndex.y*7482.4272));

    // セル内のUVを中心に移動、スケーリングして、元に戻す
    cellUV=cellUV-.5;// 中心を原点に
    cellUV=cellUV*scale;// スケーリング
    cellUV=cellUV+.5;// 元の位置に戻す
    cellUV=cellUV+offset;// オフセットを適用

    // 最終的なUV座標を計算
    return (cellIndex+cellUV)*cellSize;
}

vec4 bloom(vec4 originalColor,sampler2D originalTexture,vec2 texCoord){
    // 輝度の高い部分を抽出するための係数
    vec3 luminanceVector=vec3(.2125,.7154,.0721);
    
    // 輝度を計算
    float luminance=dot(luminanceVector,originalColor.rgb);
    
    // 固定の閾値とインテンシティ
    float threshold=.5;
    float intensity=1.5;
    
    // 閾値以上の明るい部分のみを抽出
    vec4 brightColor=vec4(0.);
    if(luminance>threshold){
        brightColor=originalColor;
    }
    
    // ブルーム効果の適用（簡易的なボックスブラー）
    vec4 bloom=vec4(0.);
    float glow=.004;
    
    for(int i=-1;i<=1;i++){
        for(int j=-1;j<=1;j++){
            vec2 offset=vec2(float(i)*glow,float(j)*glow);
            bloom+=texture2D(originalTexture,texCoord+offset);
        }
    }
    
    bloom/=9.;
    
    return originalColor+(bloom*brightColor*intensity);
}


void main(void){
    vec2 p=vTexCoord;

    // ここでテクスチャの座標を変換する ========================================================

    // p = fract(p*4.);


    p = mirror(p);


    // p = mosaic(p, 50.);

    // p.x = fract(p.x + u_time * 0.01);
    // p.y = 0.5;

    // p=gridUVTransform(p,10.);


    // ================================================================================

    vec4 mainTexCol=texture2D(u_mainTex,p);

    // ここでメインテクスチャの色を変更する ========================================================

    if(u_posterizationEnabled) mainTexCol=posterization(mainTexCol,2.);

    mainTexCol=bloom(mainTexCol,u_mainTex,vTexCoord);

    // ================================================================================

    vec4 col= mainTexCol+texture2D(u_frameTex,vTexCoord);

    // 全体の色を変更したい場合はここで色を変更する ========================================================
    if(u_monoEnabled)col=monochrome(col);
    if(u_invertEnabled)col=invert(col);

    // ================================================================================

    vec4 debugTexCol=texture2D(u_mainTex,vTexCoord)+texture2D(u_frameTex,vTexCoord);

    gl_FragColor=col;
}
precision highp float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_squareCount;
uniform float u_time;
uniform bool u_flash;
uniform float u_vol;

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

vec2 fade(vec2 t){
    return t*t*t*(t*(t*6.-15.)+10.);
}

float perlinNoise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // 4つの頂点での勾配を計算
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    
    // フェード関数を適用
    vec2 u=fade(f);
    
    // バイリニア補間
    return mix(
        mix(a,b,u.x),
        mix(c,d,u.x),
        u.y
    );
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
    return vec4(floor(col.rgb*(n+0.5))/n, col.a);
}

vec4 vignette(vec4 col,vec2 uv,float radius,float softness){
    float dist=distance(uv,vec2(.5));
    float vignette=smoothstep(radius,radius-softness,dist);
    return col*vec4(vec3(1.-vignette),1.);
}

vec4 strobe(vec4 col){
    return vec4(1.0);
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

vec4 rgbShift(vec4 col,vec2 uv,float scale,sampler2D tex){
    // 赤のチャンネルをスケール
    vec2 redUV=(uv-.5)*(1.0+scale)+.5;
    vec4 redChannel=texture2D(tex,redUV);
    
    // 他のチャンネルはそのまま
    vec4 greenChannel=texture2D(tex,uv);
    vec4 blueChannel=texture2D(tex,uv);
    
    return vec4(redChannel.r,greenChannel.g,blueChannel.b,col.a);
}

vec2 tile(vec2 uv,float n){
    return fract(uv*n);
}

vec4 veryCrop(vec4 col, vec2 uv){
    return abs(uv.y - 0.5) < 0.03 ? col : vec4(0.0);
}

// ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️

uniform bool u_mirrorEnabled;
uniform bool u_mosaicEnabled;
uniform bool u_tileEnabled;
uniform bool u_gridUVTransformEnabled;
uniform float u_rotateAngle;
uniform bool u_dripEnabled;
uniform bool u_threeSplitEnabled;
// uniform bool u_mirrorEnabled;

uniform bool u_monoEnabled;
uniform bool u_invertEnabled;
uniform bool u_posterizationEnabled;
uniform bool u_binaryEnabled;
uniform bool u_strobeEnabled;
uniform float u_vignetteRadius;
uniform float u_rgbShiftScale;
uniform bool u_veryCropEnabled;

void main(void){
    vec2 p=vTexCoord;

    // ここでテクスチャの座標を変換する ========================================================

    p=(p-0.5)*2.0;
    p*=rot(u_rotateAngle);
    p=(p+1.0)*0.5;

    if(u_mirrorEnabled) p=mirror(p);
    if(u_mosaicEnabled) p=mosaic(p,100.);
    if(u_tileEnabled) p=tile(p,4.);

    if(u_dripEnabled){
        if(p.y>(pow(u_squareCount, 4.0)*perlinNoise(vec2(p.x*10.0+ u_time*10.0)))*0.5 + 0.5){
            p.x+=sin(u_time*2.0)*random(p)*0.3;
            p.y=.5;
        }
    }

    if(u_gridUVTransformEnabled) p=gridUVTransform(p,4.);

    if(u_threeSplitEnabled){
        p.x = map(fract(p.x*3.0), 0.0, 1.0, 0.33, 0.67);
    }


    // ================================================================================

    vec4 mainTexCol=texture2D(u_mainTex,p);

    // ここでメインテクスチャの色を変更する ========================================================

    mainTexCol=vignette(mainTexCol,p, u_vignetteRadius,.5);
    mainTexCol=rgbShift(mainTexCol,p,u_rgbShiftScale,u_mainTex);

    if(u_posterizationEnabled) mainTexCol=posterization(mainTexCol,2.);
    if(u_binaryEnabled)mainTexCol=binary(mainTexCol);
    if(u_strobeEnabled && u_flash)mainTexCol=strobe(mainTexCol);
    if(u_veryCropEnabled)mainTexCol=veryCrop(mainTexCol,vTexCoord);

    // ================================================================================

    vec4 col= mainTexCol+texture2D(u_frameTex,vTexCoord);

    // 全体の色を変更したい場合はここで色を変更する ========================================================
    if(u_monoEnabled)col=monochrome(col);
    if(u_invertEnabled)col=invert(col);

    // ================================================================================

    vec4 debugTexCol=texture2D(u_mainTex,vTexCoord)+texture2D(u_frameTex,vTexCoord);

    // gl_FragColor=debugTexCol;
    gl_FragColor=col;
}



// ゴミ箱 --------------------------------------------------------------------------------

// vec4 bloom(vec4 originalColor,sampler2D originalTexture,vec2 texCoord){
//     // 輝度の高い部分を抽出するための係数
//     vec3 luminanceVector=vec3(.2125,.7154,.0721);
    
//     // 輝度を計算
//     float luminance=dot(luminanceVector,originalColor.rgb);
    
//     // 固定の閾値とインテンシティ
//     float threshold=.5;
//     float intensity=1.5;
    
//     // 閾値以上の明るい部分のみを抽出
//     vec4 brightColor=vec4(0.);
//     if(luminance>threshold){
//         brightColor=originalColor;
//     }
    
//     // ブルーム効果の適用（簡易的なボックスブラー）
//     vec4 bloom=vec4(0.);
//     float glow=.004;
    
//     for(int i=-1;i<=1;i++){
//         for(int j=-1;j<=1;j++){
//             vec2 offset=vec2(float(i)*glow,float(j)*glow);
//             bloom+=texture2D(originalTexture,texCoord+offset);
//         }
//     }
    
//     bloom/=9.;
    
//     return originalColor+(bloom*brightColor*intensity);
// }
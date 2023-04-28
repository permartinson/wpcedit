/*!
 * @pixi/filter-advanced-bloom - v5.1.1
 * Compiled Wed, 11 Jan 2023 23:10:33 UTC
 *
 * @pixi/filter-advanced-bloom is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */import{Filter as n,settings as u}from"@pixi/core";import{KawaseBlurFilter as h}from"@pixi/filter-kawase-blur";var a=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,m=`
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform float threshold;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    // A simple & fast algorithm for getting brightness.
    // It's inaccuracy , but good enought for this feature.
    float _max = max(max(color.r, color.g), color.b);
    float _min = min(min(color.r, color.g), color.b);
    float brightness = (_max + _min) * 0.5;

    if(brightness > threshold) {
        gl_FragColor = color;
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
`;class x extends n{constructor(r=.5){super(a,m),this.threshold=r}get threshold(){return this.uniforms.threshold}set threshold(r){this.uniforms.threshold=r}}var g=`uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform sampler2D bloomTexture;
uniform float bloomScale;
uniform float brightness;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    color.rgb *= brightness;
    vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);
    bloomColor.rgb *= bloomScale;
    gl_FragColor = color + bloomColor;
}
`;const c=class extends n{constructor(t){super(a,g),this.bloomScale=1,this.brightness=1,this._resolution=u.FILTER_RESOLUTION,typeof t=="number"&&(t={threshold:t});const r=Object.assign(c.defaults,t);this.bloomScale=r.bloomScale,this.brightness=r.brightness;const{kernels:l,blur:i,quality:s,pixelSize:o,resolution:e}=r;this._extractFilter=new x(r.threshold),this._extractFilter.resolution=e,this._blurFilter=l?new h(l):new h(i,s),this.pixelSize=o,this.resolution=e}apply(t,r,l,i,s){const o=t.getFilterTexture();this._extractFilter.apply(t,r,o,1,s);const e=t.getFilterTexture();this._blurFilter.apply(t,o,e,1),this.uniforms.bloomScale=this.bloomScale,this.uniforms.brightness=this.brightness,this.uniforms.bloomTexture=e,t.applyFilter(this,r,l,i),t.returnFilterTexture(e),t.returnFilterTexture(o)}get resolution(){return this._resolution}set resolution(t){this._resolution=t,this._extractFilter&&(this._extractFilter.resolution=t),this._blurFilter&&(this._blurFilter.resolution=t)}get threshold(){return this._extractFilter.threshold}set threshold(t){this._extractFilter.threshold=t}get kernels(){return this._blurFilter.kernels}set kernels(t){this._blurFilter.kernels=t}get blur(){return this._blurFilter.blur}set blur(t){this._blurFilter.blur=t}get quality(){return this._blurFilter.quality}set quality(t){this._blurFilter.quality=t}get pixelSize(){return this._blurFilter.pixelSize}set pixelSize(t){this._blurFilter.pixelSize=t}};let b=c;b.defaults={threshold:.5,bloomScale:1,brightness:1,kernels:null,blur:8,quality:4,pixelSize:1,resolution:u.FILTER_RESOLUTION};export{b as AdvancedBloomFilter};
//# sourceMappingURL=filter-advanced-bloom.mjs.map

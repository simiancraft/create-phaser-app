#define SHADER_NAME PHASER_TEXTURE_TINT_FS

precision mediump float;

uniform sampler2D uMainSampler;

varying vec2 outTexCoord;
varying vec4 outTint;

void main()
{

    vec4 tint = vec4(0.5, 0.0, 0.25, 0.25);
    vec4 texel = texture2D(uMainSampler, outTexCoord);
    texel *= vec4(tint.rgb * tint.a, tint.a);
    gl_FragColor = texel;

}
            
// Based on a render monkey (ATI, no longer available) shader and tweaked for Projekt "W"
precision mediump float;

uniform sampler2D uColorMapDay, uColorMapNight, uCloudMap;
uniform float uCloudPosition;
uniform int uForBlur;

varying float vDiffuse;
varying vec3 vSpecular;
varying vec2 vTexCoord;
varying float vAtmo;

const float Terminator = 0.3;
const float InvTerminator = 1.0 / (2.0 * Terminator);

void main (void)
{
    // Cloud layver and gloss level are stored in red and green channel of cloud map texture
    float clouds = texture2D(uCloudMap, vec2(vTexCoord.s + uCloudPosition, vTexCoord.t)).r;
    float gloss  = texture2D(uCloudMap, vec2(vTexCoord.s, vTexCoord.t)).g;

    // load daytime color, plus a specular component modulated by the gloss map
    vec3 daytime = texture2D(uColorMapDay, vTexCoord).rgb * vDiffuse + vSpecular * gloss;

    // mix in diffusely-lit clouds, modulated by the cloud opacity
    //vec3 haze = vec3(0.15, 0.45, 1.0);
    vec3 haze = vec3(75.0/255.0, 99.0/255.0, 194.0/170.0);
    if (uForBlur == 1) {
      daytime = max(vec3(vAtmo) * haze, vec3(0.0, 0.0, 0.0));
      vec3 nighttime = texture2D(uColorMapNight, vTexCoord).rgb * 1.5;
    } else {
      daytime = mix(daytime, vec3(abs(vDiffuse)), clouds);
      vec3 nighttime = texture2D(uColorMapNight, vTexCoord).rgb * (1.0 - clouds);
    }

    // load night image, modulated by cloud opacity
    vec3 nighttime = texture2D(uColorMapNight, vTexCoord).rgb * (1.0 - clouds);

    // assume day, to start
    vec3 color = daytime;

    // if fully dark, select night
    if (vDiffuse < -Terminator) {
        color = nighttime;
    }

    // within the twilight zone, mix night/day
    if (abs(vDiffuse) < Terminator ) {
        color = mix(nighttime, daytime, (vDiffuse + Terminator) * InvTerminator);
    }


    gl_FragColor = vec4(color, 1.0);
}

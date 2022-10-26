import { useCallback } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";

export const Background = () => {
    const particlesInit = useCallback(async (engine) => {
        console.log(engine);
        // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container) => {
        await console.log(container);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            style={{
                position: "absolute !important",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"}}
            options={{
                fullScreen: {
                    enable: true,
                    zIndex: -1
                },
                background: {
                    color: {
                        value: "#0e0244",
                    },
                },
                fpsLimit: 120,
                particles: {
                    color: {
                        value: ["#007efd", "#ffffff"],
                    },
                    collisions: {
                        enable: true,
                    },
                    move: {
                        directions: "none",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: false,
                        speed: 0.15,
                        straight: false,
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        },
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 80,
                    },
                    opacity: {
                        value: 0.75,
                        anim: {
                            enable: true,
                            speed: 0.2,
                            opacity_min: 0,
                            sync: false,
                        }
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 5 },
                        random: true,
                        anim: {
                            enable: true,
                            speed: 2.5,
                            size_min: 0,
                            sync: false
                        },
                        stroke: {
                            width: 0,
                            color: "#000000",
                        },
                    },
                },
                detectRetina: true,
            }}
        />
    );
};
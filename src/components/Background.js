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
        <>
        <div className="hero">
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            style={{
                position: "absolute !important",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity:.5}}
            options={{
                fullScreen: {
                    enable: true,
                    zIndex: -1
                },
                background: {
                    
                    color: {
                        value: "#162747",
                    },
                },
                fpsLimit: 120,
                interactivity: {
                    detectsOn: 'canvas',
                    events: {
                        resize: true
                    }
                },
                particles: {
                    color: {
                        value: [ "#ffffff"],
                    },
                    
                    number: {
                        density: {
                            enable: true,
                            area: 1080,
                        },
                        limit: 0,
                        value: 500,
                    },
                    opacity: {
                        
                        anim: {
                            enable: true,
                            speed: 1,
                            sync: false,
                        }
                    },
                    shape: {
                        type: "circle"
                    },
                    size: {
                        random: true,
                        anim: {
                            enable: true,
                            
                            size_min: 0.5,
                            sync: false
                        },
                        value: 1
                    },
                },
                detectRetina: true,
            }}
        />
        </div>
        </>
    );
};
import createGlobe from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";

const GLOBE_CONFIG = {
    width: 800,
    height: 800,
    onRender: () => {},
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 0.4,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [1, 1, 1],
    markerColor: [17 / 255, 69 / 255, 126 / 255], // #11457E
    glowColor: [0.8, 0.9, 1],
    markers: [
        { location: [50.0755, 14.4378], size: 0.12 }, // Prague
        { location: [48.8566, 2.3522],  size: 0.08 }, // Paris
        { location: [51.5074, -0.1278], size: 0.09 }, // London
        { location: [52.5200, 13.4050], size: 0.07 }, // Berlin
        { location: [-23.5505, -46.6333], size: 0.10 }, // São Paulo
        { location: [55.7558, 37.6173], size: 0.07 }, // Moscow
        { location: [19.4326, -99.1332], size: 0.08 }, // Mexico City
        { location: [48.2082, 16.3738], size: 0.06 }, // Vienna
    ],
};

export function Globe({ className, style, config = GLOBE_CONFIG }) {
    let phi = 0;
    let width = 0;
    const canvasRef = useRef(null);
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);
    const [r, setR] = useState(0);

    const updatePointerInteraction = (value) => {
        pointerInteracting.current = value;
        if (canvasRef.current) {
            canvasRef.current.style.cursor = value ? "grabbing" : "grab";
        }
    };

    const updateMovement = (clientX) => {
        if (pointerInteracting.current !== null) {
            const delta = clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            setR(delta / 200);
        }
    };

    const onRender = useCallback(
        (state) => {
            if (!pointerInteracting.current) phi += 0.004;
            state.phi = phi + r;
            state.width = width * 2;
            state.height = width * 2;
        },
        [r],
    );

    const onResize = () => {
        if (canvasRef.current) {
            width = canvasRef.current.offsetWidth;
        }
    };

    useEffect(() => {
        window.addEventListener("resize", onResize);
        onResize();

        const globe = createGlobe(canvasRef.current, {
            ...config,
            width: width * 2,
            height: width * 2,
            onRender,
        });

        setTimeout(() => {
            if (canvasRef.current) canvasRef.current.style.opacity = "1";
        });

        return () => {
            globe.destroy();
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <div
            className={className}
            style={{
                aspectRatio: "1/1",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    transition: "opacity 500ms ease",
                    contain: "layout paint size",
                }}
                onPointerDown={(e) =>
                    updatePointerInteraction(e.clientX - pointerInteractionMovement.current)
                }
                onPointerUp={() => updatePointerInteraction(null)}
                onPointerOut={() => updatePointerInteraction(null)}
                onMouseMove={(e) => updateMovement(e.clientX)}
                onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
            />
        </div>
    );
}

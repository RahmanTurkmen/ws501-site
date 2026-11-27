"use client";

import { useEffect, useRef, useState } from "react";
import { isCalm } from "./motion";

export type ViewerAnim = { clip: string; label: string };

type Props = {
  /** Sans modèle (pas encore livré), seule l’image est affichée. */
  src?: string;
  name: string;
  anims: ViewerAnim[];
  /** Lumière de contre-jour, dans la couleur du perso. */
  rim?: string;
  /** Image affichée avant le chargement ou si WebGL n'est pas disponible. */
  poster?: string;
};

/** Perso 3D : chargé uniquement quand il approche de l'écran, rotation au doigt ou à la souris. */
export function CharacterViewer({ src, name, anims, rim = "#19e6ff", poster }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const play = useRef<(clip: string) => void>(() => {});
  const [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const first = anims[0]?.clip;
  const [active, setActive] = useState(first);

  useEffect(() => {
    const el = host.current;
    if (!el || !src) return;
    let stop = () => {};
    let started = false;

    const start = async () => {
      if (started) return;
      started = true;
      setState("loading");
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const canvas = renderer.domElement;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", `${name} en 3D : glisse pour le faire tourner`);
        canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab";
        el.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        scene.add(new THREE.HemisphereLight("#ffffff", "#3b2d63", 1.5));
        const key = new THREE.DirectionalLight("#fff1d6", 3);
        key.position.set(3, 5, 4);
        const back = new THREE.DirectionalLight(rim, 4);
        back.position.set(-4, 2, -4);
        scene.add(key, back);

        const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(src);
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const pivot = new THREE.Group();
        pivot.add(model);
        scene.add(pivot);

        const radius = Math.max(size.x, size.y, size.z) * 0.5;
        const dist = (radius * 1.25) / Math.tan((camera.fov * Math.PI) / 360);
        camera.position.set(0, size.y * 0.05, dist);
        camera.lookAt(0, 0, 0);

        const controls = new OrbitControls(camera, canvas);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableDamping = true;
        controls.minPolarAngle = Math.PI * 0.3;
        controls.maxPolarAngle = Math.PI * 0.62;
        const calm = isCalm();
        controls.autoRotate = !calm;
        controls.autoRotateSpeed = 2.2;

        const mixer = new THREE.AnimationMixer(model);
        let current: import("three").AnimationAction | null = null;
        play.current = (clip) => {
          const c = THREE.AnimationClip.findByName(gltf.animations, clip);
          if (!c) return;
          const next = mixer.clipAction(c);
          if (next === current) return;
          next.reset().fadeIn(0.25).play();
          current?.fadeOut(0.25);
          current = next;
        };
        play.current(first ?? "");

        const resize = () => {
          const w = el.clientWidth, h = el.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        let visible = true;
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
        io.observe(el);
        const timer = new THREE.Timer();
        let raf = 0;
        const tick = () => {
          raf = requestAnimationFrame(tick);
          timer.update();
          const dt = timer.getDelta();
          if (!visible || document.hidden) return;
          mixer.update(isCalm() ? 0 : dt);
          controls.update();
          renderer.render(scene, camera);
        };
        tick();
        setState("ready");

        stop = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          controls.dispose();
          scene.traverse((o) => {
            const m = o as import("three").Mesh;
            if (m.isMesh) {
              m.geometry.dispose();
              [m.material].flat().forEach((mat) => mat.dispose());
            }
          });
          renderer.dispose();
          canvas.remove();
        };
      } catch {
        setState("failed");
      }
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); void start(); }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, [src, name, rim, first]);

  return (
    <div className="viewer">
      <div ref={host} className="viewer-stage" data-state={state}>
        {state !== "ready" && (
          // eslint-disable-next-line @next/next/no-img-element
          poster ? <img src={poster} alt={name} loading="lazy" /> : <span className="viewer-wait" aria-hidden="true">{state === "failed" ? "Panne sèche" : "clic… clic…"}</span>
        )}
      </div>
      {state === "ready" && anims.length > 1 && (
        <div className="viewer-anims" role="group" aria-label={`Animations de ${name}`}>
          {anims.map((a) => (
            <button key={a.clip} type="button" aria-pressed={active === a.clip}
              onClick={() => { setActive(a.clip); play.current(a.clip); }}>{a.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

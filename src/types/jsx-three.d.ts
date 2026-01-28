export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      ambientLight: any;
      directionalLight: any;
      color: any;
      boxGeometry: any;
      sphereGeometry: any;
      coneGeometry: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
    }
  }
}

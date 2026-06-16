import { useState, useCallback } from "react";
import useMousePosition from "./hooks/useMousePosition";
import PCBCanvas from "./components/Background/PCBCanvas";
import ConsoleWindow from "./components/Console/ConsoleWindow";
import LinuxModal from "./components/Modal/LinuxModal";

export default function App() {
  const { position, electronActive, setIsOverConsole } = useMousePosition();
  const [activeCert, setActiveCert] = useState(null);

  const handleCertClick = useCallback((cert) => {
    setActiveCert(cert);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveCert(null);
  }, []);

  return (
    <>
      {/* Capa 1: Fondo PCB con electrón */}
      <PCBCanvas mousePos={position} electronActive={electronActive} />

      {/* Capa 2: Terminal Kali */}
      <main>
        <ConsoleWindow
          onCertificateClick={handleCertClick}
          setIsOverConsole={setIsOverConsole}
        />
      </main>

      {/* Modal de certificado */}
      {activeCert && (
        <LinuxModal certificate={activeCert} onClose={handleCloseModal} />
      )}
    </>
  );
}

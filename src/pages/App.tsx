import "./App.css";
import { useRef, useState } from "react";
import { QRCode, useQRDownload } from "react-qr-master";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [link, setLink] = useState<string>("https://example.com");
  const [titulo, setTitulo] = useState<string>("Meu QR Code");
   const [subTitulo, setSubTitulo] = useState<string>("Meu QR Code");
  // ref para o QRCode na tela (usado pelo react-qr-master, se quiser manter)
  const { ref, download } = useQRDownload();

  // ref para o container invisível que será capturado no PDF
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const baixarPDFPersonalizado = async () => {
    if (!pdfContainerRef.current) return;

    try {
      // 1. Captura o container HTML como imagem de alta resolução
      const canvas = await html2canvas(pdfContainerRef.current, {
        scale: 2, // dobra a resolução para impressão nítida
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      // 2. Cria o PDF com o mesmo tamanho do canvas capturado
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      // 3. Insere a imagem capturada na página
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      // 4. Salva o arquivo
      pdf.save("qrcode-personalizado.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold underline">LOVECOLLECTION</h1>

      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 w-80"
      />
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 w-80"
      />
      <input
        type="text"
        value={subTitulo}
        onChange={(e) => setSubTitulo(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 w-80"
      />
      {/* QR Code visível na tela */}
      <QRCode ref={ref} value={link} size={256} />

      {/* Botão que usa a função de download nativa do react-qr-master (opcional) */}
      <div className="flex gap-4 p-2">
      <button
        onClick={() =>
          download("pdf", { filename: "qrcode.pdf", pixelSize: 512 })
        }
        className="bg-gray-500 text-white p-3 rounded-md"
      >
        Baixar PDF (simples)
      </button>

      {/* Botão que usa o PDF personalizado */}
      <button
        onClick={baixarPDFPersonalizado}
        className="bg-blue-500 text-white p-3 rounded-md"
      >
        Baixar PDF Personalizado
      </button>
      </div>
      {/* ============================================================ */}
      {/* Container INVISÍVEL — é isso que será capturado no PDF       */}
      {/* Posicionado fora da tela para não interferir no layout       */}
      {/* ============================================================ */}
      <div
        ref={pdfContainerRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "400px",
          padding: "40px",
          backgroundColor: "#ffffff",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          color: "#000000",
        }}
      >
        <h1 style={{ fontSize: "24px", margin: "0 0 8px 0" }}>
          {titulo}
        </h1>
        <p style={{ fontSize: "14px", margin: "0 0 24px 0", color: "#555" }}>
          Escaneie o código QR abaixo
        </p>

        {/* QR Code dentro do PDF — tamanho controlado pela prop size */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <QRCode value={link} size={120} />
        </div>

        <p style={{ fontSize: "12px", marginTop: "24px", color: "#888" }}>
          Gerado em {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
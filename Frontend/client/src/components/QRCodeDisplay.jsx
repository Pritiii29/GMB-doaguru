import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, ExternalLink, Link as LinkIcon } from 'lucide-react';

const QRCodeDisplay = ({ targetUrl }) => {
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#0f172a');

  const downloadQRCode = () => {
    const canvas = document.getElementById('qrCodeEl');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "ReviewFlow_QRCode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="qr-card flex items-center justify-center min-h-[450px] bg-white rounded-2xl border border-slate-200 overflow-hidden relative" 
           style={{ backgroundImage: 'radial-gradient(var(--color-slate-200) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <div className="bg-white p-6 rounded-3xl shadow-xl flex z-10 transition-transform duration-300 hover:scale-105">
          <QRCodeCanvas 
            id="qrCodeEl"
            value={targetUrl} 
            size={size}
            fgColor={fgColor}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      <div className="qr-card bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Customize Style</h3>
        
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-semibold text-slate-900">Target URL</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-900">
            <LinkIcon size={16} className="text-slate-500" />
            <span className="truncate">{targetUrl}</span>
            <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center text-primary hover:text-primary-hover transition-colors">
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-semibold text-slate-900">Size (px): {size}x{size}</label>
          <input 
            type="range" 
            min="128" 
            max="512" 
            step="32" 
            value={size} 
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full mt-2 accent-primary"
          />
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <label className="text-sm font-semibold text-slate-900">Foreground Color</label>
          <div className="flex items-center gap-4 mt-1">
            <input 
              type="color" 
              value={fgColor} 
              onChange={(e) => setFgColor(e.target.value)}
              className="w-12 h-12 p-0 border-2 border-slate-200 rounded-lg cursor-pointer bg-white"
            />
            <span className="font-mono font-medium text-slate-500 uppercase">{fgColor}</span>
          </div>
        </div>

        <button 
          onClick={downloadQRCode} 
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 font-semibold rounded-xl transition-all border-0 bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg focus:ring-4 focus:ring-primary/20"
        >
          <Download size={20} />
          <span>Download PNG</span>
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

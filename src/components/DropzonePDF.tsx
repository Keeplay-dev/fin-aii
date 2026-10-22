import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertCircle, Loader2, ShieldCheck, ClipboardList, FileText, Sparkles } from 'lucide-react';
import { parsePDFFile, parseRawStatementText } from '../services/pdfParser';
import type { ParsedPDFResult } from '../types/finance';

interface DropzonePDFProps {
  onPDFParsed: (result: ParsedPDFResult) => void;
}

const SAMPLE_REAL_INVOICE_TEXT = `• 9344  Planalto - Parcela 2/4                         R$ 190,35
• 9344  Ec *Ebazarcombrlt - Parcela 10/10               R$ 270,00
• 9344  Odontologia Sandreschi - Parcela 4/5            R$ 300,00
• 9344  Rodosnack Ouro Verde L                          R$ 25,80
• 9344  99app *99app                                    R$ 86,00
• 9344  55160637ariane                                  R$ 25,00
• 9344  Ifd*Paulo da Silva Res                          R$ 19,98
• 9344  Vmt*Nick Fun                                    R$ 9,00
• 9344  Restaurante da Fazenda                          R$ 129,60
• 9344  Ancar Parking Estacion                          R$ 32,00
• 3313  Dm*Spotify                                      R$ 12,90
• 9344  Totalpass                                       R$ 89,90
Estorno de "Viacao Piracicabana"                        -R$ 360,52
• 9344  Supermercados Joanin                            R$ 6,30
• 9344  Casa do Forno                                   R$ 32,90
• 9344  Realfood                                        R$ 16,94
• 9344  Pgz*Xtrememot                                   R$ 90,00
• 9344  Emigrantes Auto Posto                           R$ 28,30
• 9344  Burger King                                     R$ 70,30`;

export const DropzonePDF: React.FC<DropzonePDFProps> = ({ onPDFParsed }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processar arquivo PDF
  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Por favor, selecione um arquivo no formato PDF.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const result = await parsePDFFile(file);
      setIsProcessing(false);

      if (result.transactions.length === 0) {
        setErrorMsg('O arquivo PDF foi lido, mas não encontramos lançamentos com valores identificados. Se preferir, copie o texto da página do banco e use a aba "Colar Histórico do Site".');
      } else {
        setSuccessMsg(`${result.transactions.length} transações identificadas e categorizadas com sucesso em "${result.fileName}".`);
        onPDFParsed(result);
      }
    } catch (err: any) {
      console.error('Erro ao ler PDF:', err);
      setIsProcessing(false);
      setErrorMsg('Não foi possível extrair o texto deste PDF. Você pode copiar o texto da tela e colar na aba "Colar Histórico do Site".');
    }
  };

  // Processar texto colado do histórico do site
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Por favor, cole as linhas do seu extrato ou fatura no campo de texto.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const result = parseRawStatementText(pastedText.trim(), 'Fatura_Historico_Site.txt');
      setIsProcessing(false);

      if (result.transactions.length === 0) {
        setErrorMsg('Nenhuma transação com valor monetário (ex: R$ 50,00) foi reconhecida nas linhas coladas. Verifique o texto e tente novamente.');
      } else {
        setSuccessMsg(`${result.transactions.length} transações importadas e categorizadas com sucesso a partir do histórico do site!`);
        onPDFParsed(result);
      }
    } catch (err: any) {
      console.error('Erro ao processar texto:', err);
      setIsProcessing(false);
      setErrorMsg('Ocorreu um erro ao processar as linhas coladas. Tente novamente.');
    }
  };

  const handleFillSample = () => {
    setPastedText(SAMPLE_REAL_INVOICE_TEXT);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="no-print card" style={{ marginBottom: 24, padding: '20px 24px' }}>
      {/* Abas Superiores de Seleção de Entrada */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        borderBottom: '1px solid var(--border-pastel-blue)',
        paddingBottom: 14,
        marginBottom: 18
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setActiveTab('upload')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'upload' ? '#EFF6FF' : 'transparent',
              borderColor: activeTab === 'upload' ? '#BFDBFE' : 'transparent',
              color: activeTab === 'upload' ? '#1D4ED8' : 'var(--text-secondary)',
              fontWeight: activeTab === 'upload' ? 700 : 500
            }}
          >
            <FileText size={16} color={activeTab === 'upload' ? '#2563EB' : 'currentColor'} />
            <span>Carregar Fatura em PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'paste' ? '#EFF6FF' : 'transparent',
              borderColor: activeTab === 'paste' ? '#BFDBFE' : 'transparent',
              color: activeTab === 'paste' ? '#1D4ED8' : 'var(--text-secondary)',
              fontWeight: activeTab === 'paste' ? 700 : 500
            }}
          >
            <ClipboardList size={16} color={activeTab === 'paste' ? '#2563EB' : 'currentColor'} />
            <span>Colar Histórico do Site</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.785rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Processamento local seguro no seu navegador</span>
        </div>
      </div>

      {/* ABA 1: UPLOAD DE PDF */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed #2563EB' : '2px dashed #93C5FD',
            backgroundColor: isDragging ? '#DBEAFE' : '#F8FAFC',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 20px',
            textAlign: 'center',
            cursor: isProcessing ? 'wait' : 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.04)'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {isProcessing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Loader2 size={26} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Lendo fatura e identificando estabelecimentos...
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Extraindo estabelecimentos, datas, parcelas e valores para categorização
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.12)'
              }}>
                <UploadCloud size={26} color="#2563EB" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Arraste sua fatura ou extrato em PDF aqui
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Ou clique para selecionar • Compatível com faturas Nubank, Itaú, Santander, Inter, etc.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: COLAR HISTÓRICO DO SITE */}
      {activeTab === 'paste' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Cole o texto copiado da página do histórico do seu banco/cartão:
            </label>
            <button
              type="button"
              onClick={handleFillSample}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.785rem', padding: '4px 10px' }}
              title="Preenche com os dados reais idênticos à fatura do seu cartão"
            >
              <Sparkles size={14} color="#2563EB" />
              <span>Preencher com Exemplo da Sua Fatura</span>
            </button>
          </div>

          <textarea
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder={`Cole aqui as linhas copiadas do seu banco/cartão. Exemplo:\n• 9344  Planalto - Parcela 2/4                         R$ 190,35\n• 9344  Ec *Ebazarcombrlt - Parcela 10/10               R$ 270,00\n• 9344  Odontologia Sandreschi - Parcela 4/5            R$ 300,00\n• 9344  Rodosnack Ouro Verde L                          R$ 25,80\n• 9344  99app *99app                                    R$ 86,00\n• 9344  Ifd*Paulo da Silva Res                          R$ 19,98\n• 9344  Burger King                                     R$ 70,30`}
            rows={7}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-pastel-blue)',
              backgroundColor: '#F8FAFC',
              color: 'var(--text-primary)',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            {pastedText && (
              <button
                type="button"
                onClick={() => setPastedText('')}
                className="btn btn-secondary btn-sm"
              >
                Limpar Texto
              </button>
            )}
            <button
              type="button"
              onClick={handleProcessPastedText}
              disabled={isProcessing || !pastedText.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 20px', fontWeight: 700 }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <ClipboardList size={16} />
                  <span>Processar Histórico Copiado</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Erro */}
      {errorMsg && (
        <div style={{
          marginTop: 14,
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#B91C1C',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Alerta de Sucesso */}
      {successMsg && (
        <div style={{
          marginTop: 14,
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#047857',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.875rem'
        }}>
          <FileCheck size={18} />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};

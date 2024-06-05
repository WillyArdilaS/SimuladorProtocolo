import { useEffect, useState } from "react";

function App() {
  const [step, setStep] = useState(0);

  const [messageTx, setMessageTx] = useState('');
  const [messageTxArray, setMessageTxArray] = useState([]);
  const [frameNumber, setFrameNumber] = useState(0);
  const [ackTx, setAckTx] = useState(0);
  const [nackTx, setNackTx] = useState(0);
  const [enqTx, setEnqTx] = useState(0);
  const [ctrTx, setCtrTx] = useState(0);
  const [pptTx, setPptTx] = useState(0);
  const [lprTx, setLprTx] = useState(0);
  const [numTx, setNumTx] = useState(0);
  const [informationTx, setInformationTx] = useState('');
  const [semanticTx, setSemanticTx] = useState('');

  const [messageRec, setMessageRec] = useState('');
  const [headerRec, setHeaderRec] = useState('');
  const [trailerRec, setTrailerRec] = useState('');
  const [frameRec, setFrameRec] = useState('');
  const [informationRec, setInformationRec] = useState('');
  const [ackRec, setAckRec] = useState();
  const [nackRec, setNackRec] = useState();
  const [enqRec, setEnqRec] = useState();
  const [ctrRec, setCtrRec] = useState();
  const [pptRec, setPptRec] = useState();
  const [lprRec, setLprRec] = useState();
  const [numRec, setNumRec] = useState();
  const [semanticRec, setSemanticRec] = useState('');

  const [frameSequence, setFrameSequence] = useState([]);

  useEffect(() => {
    if (messageTx !== '') {
      setMessageTxArray(messageTx.split(' '));
      setFrameNumber(messageTxArray.length);
    } else {
      setMessageTxArray([]);
      setFrameNumber(0);
    }
  }, [messageTx]);

  useEffect(() => {
    if (step !== 0 && messageTxArray.length > 0) {
      setInformationTx(messageTxArray[step - 1]);
      setNumTx(step)
    } else {
      setInformationTx('');
      setNumTx(0);
    }
  }, [messageTxArray, step]);

  const handleSend = () => {
    if (step == 0) {
      if (messageTx === "") {
        alert('No hay ningún mensaje que transmitir');
      } else if (ctrTx !== 1 || pptTx !== 1) {
        alert('Se debe enviar un campo de control solicitando permiso para transmitir');
      } else {
        if (ackTx === 1 || nackTx === 1 || enqTx === 1 || lprTx === 1) {
          alert('Solo se deben enviar los campos de control solicitando permiso para transmitir');
        } else {
          alert('Solicitud de permiso de transmisión enviada');
          setHeaderRec(10000001);
          setTrailerRec(10000001);
          setFrameRec(`${ackTx}${nackTx}${enqTx}${ctrTx}${pptTx}${lprTx}${numTx}`);

          setAckRec(0);
          setNackRec(0);
          setEnqRec(0);
          setCtrRec(1);
          setPptRec(0);
          setLprRec(1);
          setNumRec(0);

          setSemanticTx('Trama de control');
          setMessageRec('');

          setFrameSequence((seq) => [...seq, {
            id: `Trama ${frameSequence.length + 1} (Tx)`,
            desc: 'Control, permiso para transmitir'
          }]);
        }
      }
    } else if (numTx === frameNumber && enqTx !== 1) {
      alert('Como este es el último frame debe enviar el campo ENQ con valor 1');
    } else {
      if (ackTx === 1 || nackTx === 1 || ctrTx === 1 || pptTx === 1 || lprTx === 1) {
        alert('Se están enviando campos que no son necesarios');
      } else {
        alert('Trama enviada');
        setHeaderRec(10000001);
        setTrailerRec(10000001);
        setFrameRec(`${ackTx}${nackTx}${enqTx}${ctrTx}${pptTx}${lprTx}${numTx}`);
        setInformationRec(informationTx);

        setAckRec(1);
        setNackRec(0);
        setCtrRec(0);
        setPptRec(0);
        setLprRec(0);
        setNumRec(numTx);
        enqTx == 1 ? setEnqRec(1) : setEnqRec(0);

        setSemanticTx('Trama de datos');
        setFrameSequence((seq) => [...seq, {
          id: `Trama ${frameSequence.length + 1} (Tx)`,
          desc: `Datos, trama ${numTx}`
        }]);
      }
    }
  }

  const handleRespond = () => {
    if (step === 0) {
      alert('Permiso de transmisión concedido');
      setSemanticRec('Trama de control, recibida con éxito');

      setFrameSequence((seq) => [...seq, {
        id: `Trama ${frameSequence.length + 1} (Rx)`,
        desc: 'Control, listo para recibir'
      }]);
    } else {
      alert('Trama recibida éxitosamente');
      setMessageRec(messageRec + informationRec + ' ');
      setSemanticTx('Trama de datos, recibida con éxito');
      setFrameSequence((seq) => [...seq, {
        id: `Trama ${frameSequence.length + 1} (Rx)`,
        desc: `Datos, trama ${numTx} recibida con éxito`
      }]);
    }

    setAckTx(0);
    setNackTx(0);
    setEnqTx(0);
    setCtrTx(0);
    setPptTx(0);
    setLprTx(0)
    setNumTx(0);

    setHeaderRec();
    setTrailerRec();
    setFrameRec();
    setInformationRec('')
    setAckRec();
    setNackRec();
    setEnqRec();
    setCtrRec();
    setPptRec();
    setLprRec();
    setNumRec();

    setStep(step + 1);

    if (step == frameNumber) {
      alert('La transmisión se ha completado con éxito');

      setFrameSequence((seq) => [...seq, {
        id: `Fin de la transmisión (Rx)`,
        desc: `Mensaje recibido con éxito`
      }]);

      setMessageTx('');
      setSemanticTx('');
      setSemanticRec('');
      setStep(0);
    }
  }

  return (
    <main className="flex justify-between w-full">
      <section className="w-1/2 ml-12">
        <div className="mt-24">
          <article>
            <h1 className="text-2xl font-bold"> Transmisor </h1>

            <section className="flex mt-4">
              <div className="flex ">
                <h2 className="text-lg font-semibold"> Mensaje a transmitir </h2>
                <input type="text" className="w-60 ml-4 px-2 border-2 border-black shadow-md" disabled={step !== 0 ? true : false} value={messageTx}
                  onChange={(e) => setMessageTx(e.target.value)} />
              </div>

              <div className="flex ml-12">
                <h2 className="text-lg font-semibold"> Número de frames </h2>
                <input type="number" min={0} className="w-20 ml-4 px-2 border-2 border-black shadow-md" disabled={step !== 0 ? true : false} value={frameNumber}
                  onChange={(e) => setFrameNumber(parseInt(e.target.value))} />
              </div>
            </section>

            <section className="flex justify-between items-center mt-8">
              <section className="flex">
                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> Indicador </h3>
                  <div className="w-24 px-2 font-semibold text-center border-2 border-black shadow-md"> 10000001 </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> ACK </h3>
                  <div className="w-12 px-2 font-semibold text-center border-2 border-black shadow-md"> {ackTx} </div>
                  <input type="checkbox" className="w-5 h-5 mt-2" checked={ackTx} onChange={(e) => setAckTx(e.target.checked ? 1 : 0)} />
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> NACK </h3>
                  <div className="w-12 px-2 font-semibold text-center border-2 border-black shadow-md"> {nackTx} </div>
                  <input type="checkbox" className="w-5 h-5 mt-2" checked={nackTx} onChange={(e) => setNackTx(e.target.checked ? 1 : 0)} />
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> ENQ </h3>
                  <div className="w-12 px-2 font-semibold text-center border-2 border-black shadow-md"> {enqTx} </div>
                  <input type="checkbox" className="w-5 h-5 mt-2" checked={enqTx} onChange={(e) => setEnqTx(e.target.checked ? 1 : 0)} />
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> CTR </h3>
                  <div className="w-12 px-2 font-semibold text-center border-2 border-black shadow-md"> {ctrTx} </div>
                  <input type="checkbox" className="w-5 h-5 mt-2" checked={ctrTx} onChange={(e) => setCtrTx(e.target.checked ? 1 : 0)} />
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> PPT </h3>
                  <div className="w-12 px-2 font-semibold text-center border-2 border-black shadow-md"> {pptTx} </div>
                  <input type="checkbox" className="w-5 h-5 mt-2" checked={pptTx} onChange={(e) => setPptTx(e.target.checked ? 1 : 0)} />
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> LPR </h3>
                  <div className="w-12 px-2 font-semibold text-center border-2 border-black shadow-md"> {lprTx} </div>
                  <input type="checkbox" className="w-5 h-5 mt-2" checked={lprTx} onChange={(e) => setLprTx(e.target.checked ? 1 : 0)} />
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> NUM </h3>
                  <div className="w-12 px-2 font-semibold text-center border-2 border-black shadow-md"> {numTx} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> Información </h3>
                  <div className="w-24 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {informationTx} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> Indicador </h3>
                  <div className="w-24 px-2 font-semibold text-center border-2 border-black shadow-md"> 10000001 </div>
                </div>
              </section>

              <button className="w-32 h-10 bg-gray-50 border-2 border-gray-400 font-semibold shadow-md hover:bg-gray-100" onClick={handleSend}> ENVIAR </button>
            </section>

            <section className="flex mt-6">
              <h2 className="mr-2 font-semibold"> Semántica: </h2>
              <h2> {semanticTx} </h2>
            </section>
          </article>
        </div>

        <div className="mt-24">
          <article>
            <h1 className="text-2xl font-bold"> Receptor </h1>

            <h2 className="mt-4 mb-2 font-semibold"> Trama recibida: </h2>
            <section className="flex">
              <div className="flex flex-col items-center">
                <div className="w-24 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {headerRec} </div>
                <h3 className="mb-1 text-sm"> Header </h3>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-32 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {frameRec} </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-24 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {informationRec} </div>
                <h3 className="mb-1 text-sm"> Información </h3>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-24 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {trailerRec} </div>
                <h3 className="mb-1 text-sm"> Trailer </h3>
              </div>
            </section>

            <h2 className="mt-4 font-semibold"> Respuesta: </h2>
            <section className="flex justify-between items-center mt-2">
              <section className="flex">
                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> Indicador </h3>
                  <div className="w-24 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {headerRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> ACK </h3>
                  <div className="w-12 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {ackRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> NACK </h3>
                  <div className="w-12 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {nackRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> ENQ </h3>
                  <div className="w-12 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {enqRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> CTR </h3>
                  <div className="w-12 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {ctrRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> PPT </h3>
                  <div className="w-12 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {pptRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> LPR </h3>
                  <div className="w-12 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {lprRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> NUM </h3>
                  <div className="w-12 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {numRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> Información </h3>
                  <div className="w-24 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {informationRec} </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="mb-1 text-sm"> Indicador </h3>
                  <div className="w-24 h-7 px-2 font-semibold text-center border-2 border-black shadow-md"> {trailerRec} </div>
                </div>
              </section>

              <button className="w-32 h-10 bg-gray-50 border-2 border-gray-400 font-semibold shadow-md hover:bg-gray-100" onClick={handleRespond}> RESPONDER </button>
            </section>

            <section className="flex mt-6">
              <h2 className="mr-2 font-semibold"> Semántica: </h2>
              <h2> {semanticRec} </h2>
            </section>

            <section className="flex items-center mt-8">
              <h2 className="font-semibold"> Mensaje recibido: </h2>
              <div className="w-1/4 h-7 ml-4 px-2 font-semibold border-2 border-black shadow-md"> {messageRec} </div>
            </section>
          </article>
        </div>
      </section>

      <section className="w-1/4 mt-6 mr-48">
        <article className="">
          <h1 className="text-2xl font-bold"> Secuencia de tramas </h1>

          <section className="h-screen overflow-y-auto mt-6 p-3 border-2 border-black">
              {
                frameSequence.map(frame => (
                  <div className="mb-4">
                    <h3 className="font-semibold"> {frame.id} </h3>
                    <h3> {frame.desc} </h3>
                  </div>
                ))
              }
          </section>
        </article>
      </section>
    </main>
  )
}

export default App

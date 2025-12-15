"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function RecordPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<"video" | "audio">("video");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const constraints = mode === "video" 
        ? { video: true, audio: true } 
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (mode === "video" && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mode === "video" ? 'video/webm' : 'audio/webm' 
        });
        setMediaBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Kon geen toegang krijgen tot camera/microfoon. Controleer de permissies in je browser.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Download recording
  const downloadRecording = () => {
    if (!mediaBlob) return;
    
    const url = URL.createObjectURL(mediaBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.${mode === "video" ? "webm" : "webm"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Direct Opnemen</h1>
          <p className="text-slate-600">Test je opnamefunctionaliteit zonder backend</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Opname-instellingen</CardTitle>
              <CardDescription>Kies je opnamemodus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Modus:</span>
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setMode("video")}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 transition ${
                      mode === "video"
                        ? "bg-orange text-white"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("audio")}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 transition ${
                      mode === "audio"
                        ? "bg-orange text-white"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Audio
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {!isRecording && !mediaBlob && (
                  <Button
                    onClick={startRecording}
                    className="bg-orange hover:bg-orange/90 text-white"
                  >
                    Start opname
                  </Button>
                )}

                {isRecording && (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-slate-600">
                      Opname bezig... {formatTime(recordingTime)}
                    </div>
                    <Button 
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white w-full"
                    >
                      Stop opname
                    </Button>
                  </div>
                )}

                {mediaBlob && (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-slate-600">
                      Opname voltooid!
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={downloadRecording}
                        className="bg-green-500 hover:bg-green-600 text-white flex-1"
                      >
                        Download
                      </Button>
                      <Button 
                        onClick={() => {
                          setMediaBlob(null);
                          setRecordingTime(0);
                        }}
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                      >
                        Opnieuw
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Voorbeeld</CardTitle>
              <CardDescription>{mode === "video" ? "Camera feed" : "Audio visualisatie"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                {isRecording && mode === "video" ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : mode === "video" ? (
                  <div className="text-center text-slate-500">
                    <p>Camera voorbeeld verschijnt hier</p>
                    <p className="text-sm mt-2">Klik op "Start opname" om te beginnen</p>
                  </div>
                ) : isRecording ? (
                  <div className="text-center">
                    <div className="flex justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 bg-orange rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 40 + 10}px`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-slate-500">Audio-opname bezig...</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <p>Audio visualisatie verschijnt hier</p>
                    <p className="text-sm mt-2">Klik op "Start opname" om te beginnen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={() => router.push("/dashboard")}
            variant="secondary"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900"
          >
            Terug naar dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
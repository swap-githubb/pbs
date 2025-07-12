import React, { useState } from 'react';
import { Container, Button, Card, CardContent, Typography, ThemeProvider } from '@mui/material';
import { theme, globalStyles } from './styles/globalStyles';
import AudioRecorder from './AudioRecorder';
import ChatPanel from './ChatPanel';
import DisplayPanel from './DisplayPanel';
import Header from './Header';
import api from '../../utils/api';

export default function ConsultationApp() {
  const [conversation, setConversation] = useState([]);
  const [soapNote, setSoapNote] = useState('');
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState('');
  const [processing, setProcessing] = useState(false);
    const cleanOutput = (text) => {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  };

  const handleTurnUploadSuccess = (data) => {
    setConversation((prev) => [
      ...prev,
      { role: 'patient', message: data.transcript },
      { role: 'doctor', message: cleanOutput(data.doctor_response) }
    ]);
  };

  const finalizeConversation = async () => {
    const conversationStr = conversation
      .map(turn => `${turn.role === 'doctor' ? 'Dr. Steve' : 'Patient'}: ${turn.message}`)
      .join('\n');
    
    setProcessing(true);
    try {
      const response = await api.post('/conversation/finalize_conversation', {
        conversation: conversationStr
      });
      setSoapNote(cleanOutput(response.data.soap_note));
      setDifferentialDiagnosis(cleanOutput(response.data.differential_diagnosis));
    } catch (error) {
      console.error("Finalization error:", error);
    }
    setProcessing(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <style>{globalStyles}</style>
      <div>
        <Header />
        <Container maxWidth="md" style={{ marginTop: '20px' }}>
          <AudioRecorder
            onUploadSuccess={handleTurnUploadSuccess}
            conversation={conversation}
            endpoint="conversation_turn"
          />
          <ChatPanel conversation={conversation} />
          <Button
            variant="contained"
            color="primary" 
            onClick={finalizeConversation}
            style={{ margin: '20px 0' }}
            disabled={conversation.length === 0}
          >
            Finish Conversation
          </Button>
           {processing && (
              <Card style={{ 
                margin: '20px 0',
                backgroundColor: '#e3f2fd',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)'
              }}>
                <CardContent>
                  <Typography variant="body1" style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px' }}>⏳</span>
                    Have patience! Generating clinical documentation...
                  </Typography>
                </CardContent>
              </Card>
            )}
          <DisplayPanel
            soapNote={soapNote}
            differentialDiagnosis={differentialDiagnosis}
          />
        </Container>
      </div>
    </ThemeProvider>
  );
}
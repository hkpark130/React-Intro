// src/components/projects/ChatBot.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Stack,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import WebIcon from '@mui/icons-material/Web';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SchoolIcon from '@mui/icons-material/School';
import ApiIcon from '@mui/icons-material/Api';
import CodeAccordion from '@/components/section/CodeAccordion';

/* =======================
   섹션 애니메이션 Variants 정의
   ======================= */
const sectionVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};

export default function ChatBot() {
  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}
    >
      <motion.article
        initial="hidden"
        animate="visible"
        variants={sectionVariant}
        style={{ maxWidth: 1040, margin: '0 auto' }}
      >
        <motion.div variants={sectionVariant} custom={0}>
          <HeroSection />
        </motion.div>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <motion.div variants={sectionVariant} custom={1} style={{ marginTop: 32 }}>
          <TechStackSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={2} style={{ marginTop: 32 }}>
          <OverviewSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={3} style={{ marginTop: 32 }}>
          <ModelArchitectureSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
          <DataSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={5} style={{ marginTop: 32 }}>
          <TrainingSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={6} style={{ marginTop: 32 }}>
          <APISection />
        </motion.div>
      </motion.article>
    </Container>
  );
}

function HeroSection() {
  return (
    <>
      <TitleSection
        title="AI 챗봇 (Transformer)"
        subtitle="포트폴리오 안내 챗봇 프로젝트"
        description="PyTorch 기반 미니 Transformer 모델을 활용한 포트폴리오 안내 챗봇. 
        로컬에서 학습 후 AWS EC2에 배포하여 안내 챗봇 서비스를 제공합니다."
      />
      <Alert 
        severity="warning" 
        sx={{ 
          mt: 2, 
          fontSize: '0.875rem', 
          borderLeft: '4px solid #ed6c02',
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          💡 왜 직접 구현했나요?
        </Typography>
        <Typography variant="body2">
          AWS EC2 <strong>t2.micro (RAM 1GB)</strong> 사양에서는 LLaMA 같은 대형 모델 구동이 불가능합니다.
          <br />
          → 직접 <strong>경량화된 Mini Transformer </strong>를 설계하여 
          저사양, GPU가 없는 환경에서도 원활하게 동작할 수 있도록 구현했습니다.
        </Typography>
      </Alert>
    </>
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'AWS EC2', color: 'warning' },
        { label: 'Docker', color: 'info' },
      ],
    },
    {
      category: '백엔드',
      labels: [
        { label: 'Python', color: 'primary' },
        { label: 'FastAPI', color: 'success' },
      ],
    },
    {
      category: 'AI/ML',
      labels: [
        { label: 'PyTorch', color: 'error' },
        { label: 'Transformer', color: 'secondary' },
      ],
    },
    {
      category: '프론트엔드',
      labels: [
        { label: 'React', color: 'info' },
        { label: 'Material-UI', color: 'primary' },
      ],
    },
  ];

  return (
    <TechStack techStacks={techStacks} />
  );
}

function OverviewSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <WebIcon color="primary" /> 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        이 프로젝트는 포트폴리오 사이트 전용 AI 챗봇입니다. 
        Transformer 모델(약 19M 파라미터, 512 dim, 6 layers)을 직접 설계하고 학습하여, 
        AWS t2.micro 인스턴스에서도 원활하게 동작할 수 있도록 최적화했습니다.
      </Typography>
      <Typography variant="body1" component="p">
        포트폴리오 안내, 블로그 포스트 추천, 간단한 대화 등의 기능을 제공하며,
        338개의 커스텀 데이터셋을 5배 복제하여 학습했습니다.
      </Typography>
    </Box>
  );
}

function ModelArchitectureSection() {
  const modelCode = `class ChatBot(nn.Module):
    def __init__(self, vocab_size, d_model=512, n_layers=6, n_heads=8, dropout=0.15):
        super().__init__()
        self.d_model = d_model
        
        # 임베딩
        self.embed = nn.Embedding(vocab_size, d_model)
        self.pos = nn.Parameter(torch.zeros(1, 150, d_model))
        self.dropout = nn.Dropout(dropout)
        self.embed_norm = nn.LayerNorm(d_model)
        
        # 트랜스포머 (6 layers, 8 heads)
        layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=n_heads,
            dim_feedforward=d_model * 4,
            dropout=dropout, activation='gelu', batch_first=True
        )
        self.transformer = nn.TransformerEncoder(layer, num_layers=n_layers)
        
        # 출력
        self.out_norm = nn.LayerNorm(d_model)
        self.fc = nn.Linear(d_model, vocab_size)
        
    def forward(self, x):
        seq_len = x.size(1)
        x = self.embed(x) * (self.d_model ** 0.5)
        x = x + self.pos[:, :seq_len, :]
        x = self.dropout(x)
        x = self.embed_norm(x)
        mask = torch.triu(torch.ones(seq_len, seq_len), diagonal=1).bool().to(x.device)
        x = self.transformer(x, mask=mask)
        x = self.out_norm(x)
        return self.fc(x)`;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <ArchitectureIcon color="secondary" /> 모델 아키텍처
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        경량화된 Transformer Encoder 기반 모델로, AWS t2.micro에서도 빠르게 추론할 수 있도록 설계했습니다.
      </Typography>

      <FlowAndTermsSection />

      <CodeAccordion 
        title="ChatBot 모델 클래스 - PyTorch (512 dim, 6 layers, 8 heads)"
        codeString={modelCode}
        language="python"
      />
    </Box>
  );
}

function DataSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <DataObjectIcon color="success" /> 데이터 구성
      </Typography>
      
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
          mb: 3
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: '#e3f2fd',
                border: '1px solid #bbdefb',
                height: '100%'
              }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  📊 원본 데이터 (338개)
                </Typography>
                <Typography variant="body2">
                  <strong>기본 대화:</strong> 100개<br />
                  인사, 감사, 질문 등 일반 대화<br /><br />
                  <strong>포트폴리오 안내:</strong> 100개<br />
                  주인 소개, 기술 스택, 프로젝트 안내<br /><br />
                  <strong>블로그 포스트 링크:</strong> 138개<br />
                  키워드 → 블로그 URL 매핑
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: '#fff8e1',
                border: '1px solid #ffecb3',
                height: '100%'
              }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  🚀 데이터 증강
                </Typography>
                <Typography variant="body2">
                  <strong>증강 전:</strong> 338개<br />
                  <strong>증강 후:</strong> 338 × 200 = <strong style={{ color: '#f50057' }}>67,600개</strong><br /><br />
                  <strong>Train/Val 분리:</strong><br />
                  - Train: 278,720개 (80%)<br />
                  - Validation: 69,680개 (20%)<br /><br />
                  <Typography variant="caption" color="textSecondary">
                    * 작은 도메인 특화 데이터 + 많은 반복이 효과적
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: '#f3e5f5',
                border: '1px solid #ce93d8',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  📝 데이터 예시
                </Typography>
                <ZoomableImageModal
                  imageSrc="/images/chatbot-data.png"
                  altText="챗봇 학습 데이터 JSON 예시"
                  sx={{ 
                    maxWidth: '100%',
                    maxHeight: 180,
                    width: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top left'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="body2" color="textSecondary">
        💡 <strong>Tip:</strong> AI Hub 같은 대규모 범용 데이터는 오히려 노이즈가 됩니다. 
        특정 도메인 챗봇은 작은 커스텀 데이터셋 + 많은 반복 학습이 더 효과적입니다.
      </Typography>
    </Box>
  );
}

function TrainingSection() {
  const trainingCode = `# 학습 설정
optimizer = torch.optim.AdamW(model.parameters(), lr=5e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)
criterion = nn.CrossEntropyLoss(ignore_index=0, label_smoothing=0.1)

EPOCHS = 100
patience = 15  # Early Stopping

for epoch in range(EPOCHS):
    # Training
    model.train()
    for batch in train_loader:
        out = model(batch[:, :-1])
        loss = criterion(out.reshape(-1, vocab_size), batch[:, 1:].reshape(-1))
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # Gradient Clipping
        optimizer.step()
    
    # Validation & Early Stopping
    model.eval()
    val_loss = evaluate(model, val_loader)
    
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), 'checkpoints/best.pt')`;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <SchoolIcon color="warning" /> 학습 과정
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* 학습 설정 카드 */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Card elevation={2} sx={{ width: '100%', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ff9800' }} gutterBottom>
                <strong>⚙️ 학습 설정</strong>
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li><strong>Optimizer:</strong> AdamW (lr=5e-4, weight_decay=0.01)</li>
                  <li><strong>Scheduler:</strong> CosineAnnealingLR</li>
                  <li><strong>Epochs:</strong> 100 (Early Stopping)</li>
                  <li><strong>Batch Size:</strong> 32</li>
                  <li><strong>Gradient Clipping:</strong> 1.0</li>
                  <li><strong>Early Stop Patience:</strong> 15</li>
                  <li><strong>Label Smoothing:</strong> 0.1</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* 학습 결과 카드 */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Card elevation={2} sx={{ width: '100%', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#4caf50' }} gutterBottom>
                <strong>📈 학습 결과</strong>
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li><strong>Final Train Loss:</strong> 1.1189</li>
                  <li><strong>Final Val Loss:</strong> 1.1234</li>
                  <li><strong>Best Val Loss:</strong> 1.1234</li>
                  <li><strong>학습 시간:</strong> ~30분 (RTX 4070)</li>
                  <li><strong>모델 크기:</strong> ~76MB</li>
                  <li><strong>추론 속도:</strong> &lt;100ms (CPU)</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Loss 그래프 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <strong>📉 학습 진행 그래프</strong>
        </Typography>
        <ZoomableImageModal
          imageSrc="/images/loss.png"
          altText="Training Progress - Loss Curve"
          caption="Train/Val Loss 변화 (Best Val Loss: 1.1234)"
          sx={{ border: '2px solid #ddd', borderRadius: 2 }}
        />
      </Box>

      <CodeAccordion 
        title="학습 루프 코드"
        codeString={trainingCode}
        language="python"
      />
    </Box>
  );
}

function APISection() {
  const apiCode = `@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    answer = generate(req.question, req.temperature)
    return ChatResponse(answer=answer)

def generate(text: str, temperature: float = 0.3, top_k: int = 30) -> str:
    # 토큰화: <S> + question + <X>
    tokens = [bos] + [token2id.get(c, unk) for c in text] + [sep]
    input_ids = torch.tensor([tokens], dtype=torch.long)
    
    model.eval()
    with torch.no_grad():
        for _ in range(80):  # 최대 80 토큰 생성
            out = model(input_ids)
            logits = out[:, -1, :]
            
            # 특수 토큰 억제 (PAD, UNK, BOS, SEP)
            logits[:, [pad, unk, bos, sep]] = -1e9
            
            # Top-k 샘플링
            if temperature <= 0.05:
                next_token = torch.argmax(logits, dim=-1, keepdim=True)
            else:
                next_token = top_k_sample(logits / temperature, top_k)
            
            if next_token.item() == eos:  # <E> = EOS
                break
            input_ids = torch.cat([input_ids, next_token], dim=1)
    
    # 디코딩 (특수토큰 제외: id > 4)
    result = ''.join([id2token.get(i, '') for i in input_ids[0].tolist()[len(tokens):] if i > 4])
    return result if result else "죄송해요, 잘 모르겠어요!"`;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <ApiIcon color="info" /> API 서버
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        FastAPI 기반의 경량 API 서버로, Docker 컨테이너로 배포됩니다.
        CPU 전용으로 최적화되어 AWS t2.micro에서도 원활하게 동작합니다.
      </Typography>

      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 100%)',
          mb: 3
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="primary">POST</Typography>
                <Typography variant="body2">/api/chat</Typography>
                <Chip label="채팅 API" size="small" color="primary" sx={{ mt: 1 }} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="success.main">GET</Typography>
                <Typography variant="body2">/api/health</Typography>
                <Chip label="헬스체크" size="small" color="success" sx={{ mt: 1 }} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="info.main">GET</Typography>
                <Typography variant="body2">/docs</Typography>
                <Chip label="Swagger UI" size="small" color="info" sx={{ mt: 1 }} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="warning.main">Docker</Typography>
                <Typography variant="body2">Port 8000</Typography>
                <Chip label="컨테이너" size="small" color="warning" sx={{ mt: 1 }} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <CodeAccordion 
        title="FastAPI 엔드포인트 및 생성 함수"
        codeString={apiCode}
        language="python"
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          🗨️ 챗봇 테스트 예시
        </Typography>
        <Card elevation={1} sx={{ bgcolor: '#f5f5f5', p: 2 }}>
          <Stack spacing={1}>
            <Box>
              <Typography variant="body2" color="primary" fontWeight="bold">Q: 안녕?</Typography>
              <Typography variant="body2">A: 안녕하세요! 포트폴리오에 오신 것을 환영합니다. 무엇이 궁금하신가요?</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="primary" fontWeight="bold">Q: 주인 누구?</Typography>
              <Typography variant="body2">A: 박현경님이에요! DevOps 엔지니어로 일하고 계세요.</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="primary" fontWeight="bold">Q: kubernetes</Typography>
              <Typography variant="body2">A: Kubernetes에 관심 있으시군요! https://hkpark130.p-e.kr/blog/95 에서 자세히 확인해보세요!</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="primary" fontWeight="bold">Q: openstack</Typography>
              <Typography variant="body2">A: OpenStack 구축에 관심 있으시군요! https://hkpark130.p-e.kr/blog/54 에서 자세히 확인해보세요!</Typography>
            </Box>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}

function FlowAndTermsSection() {
  const [flowType, setFlowType] = useState('inference');

  const handleFlowChange = (event, newFlow) => {
    if (newFlow !== null) {
      setFlowType(newFlow);
    }
  };

  return (
    <Box>
      {/* 토글 버튼 + 이미지 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={flowType}
            exclusive
            onChange={handleFlowChange}
            size="medium"
          >
            <ToggleButton 
              value="inference" 
              sx={{ 
                px: 3, 
                py: 1,
                '&.Mui-selected': { bgcolor: '#f3e5f5', color: '#9c27b0' }
              }}
            >
              🔮 추론 흐름
            </ToggleButton>
            <ToggleButton 
              value="training" 
              sx={{ 
                px: 3, 
                py: 1,
                '&.Mui-selected': { bgcolor: '#fff3e0', color: '#ff9800' }
              }}
            >
              🎓 학습 흐름
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <ZoomableImageModal
          imageSrc={flowType === 'inference' 
            ? "/images/infer.png" 
            : "/images/learning.png"}
          altText={flowType === 'inference' ? "Transformer 추론 아키텍처" : "Transformer 학습 흐름"}
          caption={flowType === 'inference' 
            ? "Mini Transformer 추론 아키텍처" 
            : "Mini Transformer 학습 흐름"}
          sx={{ border: '2px solid #ddd', borderRadius: 2 }}
        />
      </Box>

      {/* 동작 흐름 + 핵심 용어 카드 */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* 동작 흐름 카드 */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Card elevation={2} sx={{ width: '100%', borderLeft: `4px solid ${flowType === 'inference' ? '#9c27b0' : '#ff9800'}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: flowType === 'inference' ? '#9c27b0' : '#ff9800', mb: 1.5 }}>
                <strong>{flowType === 'inference' ? '🔮 추론 흐름' : '🎓 학습 흐름'}</strong>
              </Typography>
            
            {flowType === 'inference' ? (
              <Stack spacing={0.3} sx={{ fontSize: '13px' }}>
                <Typography variant="body2"><strong>1️⃣</strong> "안녕?" 입력</Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>2️⃣</strong> Tokenizer: 글자를 숫자로 변환 <code style={{ background: '#e8e8e8', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>[2, 34, 56, 78, 4]</code></Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>3️⃣</strong> Embedding: 숫자를 512차원 벡터로 변환 + 위치 정보 추가</Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>4️⃣</strong> Transformer Encoder (×6번 반복):</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• Self-Attention: 글자 간 관계 파악</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• Feed Forward: 정보 변환/처리</Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>5️⃣</strong> Linear + Softmax: 다음 글자 예측</Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>6️⃣</strong> "안녕하세요!" 출력</Typography>
              </Stack>
            ) : (
              <Stack spacing={0.3} sx={{ fontSize: '13px' }}>
                <Typography variant="body2"><strong>1️⃣</strong> 데이터 준비: Q&A 쌍 토큰화</Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>2️⃣</strong> Forward Pass (순전파):</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• 입력 → Transformer → 예측 확률</Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>3️⃣</strong> Loss 계산: <code style={{ background: '#e8e8e8', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>CrossEntropyLoss(예측, 정답)</code></Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>4️⃣</strong> Backward Pass (역전파):</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• Backpropagation으로 그래디언트 계산</Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>5️⃣</strong> 가중치 업데이트: <code style={{ background: '#e8e8e8', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>AdamW Optimizer</code></Typography>
                <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>↓</Typography>
                <Typography variant="body2"><strong>6️⃣</strong> 반복 (100 epochs, Early Stopping)</Typography>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
      
      {/* 핵심 용어 카드 (토글에 따라 변경) */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
        <Card elevation={2} sx={{ width: '100%', borderLeft: `4px solid ${flowType === 'inference' ? '#2196f3' : '#4caf50'}` }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: flowType === 'inference' ? '#2196f3' : '#4caf50' }} gutterBottom>
              <strong>{flowType === 'inference' ? '📖 추론 핵심 용어' : '📖 학습 핵심 용어'}</strong>
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', py: 0.5 }}>용어</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 0.5 }}>하는 일</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 0.5 }}>비유</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flowType === 'inference' ? (
                    <>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Tokenizer</TableCell>
                        <TableCell sx={{ py: 0.5 }}>글자→숫자</TableCell>
                        <TableCell sx={{ py: 0.5 }}>번호표 붙이기</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Embedding</TableCell>
                        <TableCell sx={{ py: 0.5 }}>숫자→벡터</TableCell>
                        <TableCell sx={{ py: 0.5 }}>의미있는 좌표로</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Positional</TableCell>
                        <TableCell sx={{ py: 0.5 }}>위치 정보 추가</TableCell>
                        <TableCell sx={{ py: 0.5 }}>몇 번째 글자인지</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Self-Attention</TableCell>
                        <TableCell sx={{ py: 0.5 }}>글자 간 관계</TableCell>
                        <TableCell sx={{ py: 0.5 }}>서로 연결해서 이해</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Feed Forward</TableCell>
                        <TableCell sx={{ py: 0.5 }}>정보 변환</TableCell>
                        <TableCell sx={{ py: 0.5 }}>뇌에서 처리</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Softmax</TableCell>
                        <TableCell sx={{ py: 0.5 }}>확률 분포 생성</TableCell>
                        <TableCell sx={{ py: 0.5 }}>다음 글자 확률</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Temperature</TableCell>
                        <TableCell sx={{ py: 0.5 }}>샘플링 조절</TableCell>
                        <TableCell sx={{ py: 0.5 }}>창의성 vs 정확성</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Autoregressive</TableCell>
                        <TableCell sx={{ py: 0.5 }}>순차 생성</TableCell>
                        <TableCell sx={{ py: 0.5 }}>한 글자씩 이어쓰기</TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Softmax</TableCell>
                        <TableCell sx={{ py: 0.5 }}>확률 분포 생성</TableCell>
                        <TableCell sx={{ py: 0.5 }}>예측 확률 계산</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>CrossEntropy</TableCell>
                        <TableCell sx={{ py: 0.5 }}>손실 함수</TableCell>
                        <TableCell sx={{ py: 0.5 }}>얼마나 틀렸나 측정</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Backprop</TableCell>
                        <TableCell sx={{ py: 0.5 }}>역전파</TableCell>
                        <TableCell sx={{ py: 0.5 }}>오차 원인 추적</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Gradient</TableCell>
                        <TableCell sx={{ py: 0.5 }}>기울기 계산</TableCell>
                        <TableCell sx={{ py: 0.5 }}>어느 방향으로 개선?</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>AdamW</TableCell>
                        <TableCell sx={{ py: 0.5 }}>가중치 업데이트</TableCell>
                        <TableCell sx={{ py: 0.5 }}>모멘텀+가중치감쇠</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Grad Clipping</TableCell>
                        <TableCell sx={{ py: 0.5 }}>기울기 제한</TableCell>
                        <TableCell sx={{ py: 0.5 }}>폭발 방지</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Dropout</TableCell>
                        <TableCell sx={{ py: 0.5 }}>랜덤 뉴런 끄기</TableCell>
                        <TableCell sx={{ py: 0.5 }}>과적합 방지</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>Early Stop</TableCell>
                        <TableCell sx={{ py: 0.5 }}>조기 종료</TableCell>
                        <TableCell sx={{ py: 0.5 }}>과적합 전에 멈춤</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  </Box>
  );
}


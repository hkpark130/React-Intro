// src/components/projects/Python.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal'; 
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
import WebIcon from '@mui/icons-material/Web';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import DataObjectIcon from '@mui/icons-material/DataObject';
import StorageIcon from '@mui/icons-material/Storage';
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

export default function Python() {
  return (
    <Container 
      maxWidth="md" 
      sx={{
        mx: "auto",               // 중앙 정렬
        py: { xs: 3, sm: 4, md: 6 }, // 반응형 상하 패딩
        px: { xs: 2, sm: 3, md: 1 }, // 반응형 좌우 패딩
        display: 'flex', 
        flexDirection: 'column'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{
          borderRadius: 3, 
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 3, sm: 4 },
          bgcolor: '#f9f9ff'
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariant}
        >
          {/* 한 모션으로 감싸고, 내부에서 각각 모션 적용 */}
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
            <ProjectStructureSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
            <DataFlowSection />
          </motion.div>
          
          <motion.div variants={sectionVariant} custom={5} style={{ marginTop: 32 }}>
            <CacheSection />
          </motion.div>
          
          <motion.div variants={sectionVariant} custom={6} style={{ marginTop: 32 }}>
            <ServerStructureSection />
          </motion.div>
          
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          
          <motion.div variants={sectionVariant} custom={7} style={{ marginTop: 32 }}>
            <ReferenceSection />
          </motion.div>
        </motion.div>
      </Paper>
    </Container>
  );
}

function HeroSection() {
  return (
    <TitleSection
      title="머신러닝 (Python)"
      subtitle="도쿄 23구 집 값 예측(선형회귀) 프로젝트"
      description="TensorFlow 기반 3층 신경망 모델을 활용한 월세 예측 서비스. 개인 학습용이라서 accuracy가 낮습니다."
    />
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
        { label: 'Tornado', color: 'info' },
        { label: 'Gunicorn', color: 'success' },
        { label: 'Supervisord', color: 'warning' },
        { label: 'Redis', color: 'error' },
      ],
    },
    {
      category: '프레임워크',
      labels: [
        { label: 'Laravel', color: 'error' },
        { label: 'Tensorflow', color: 'warning' },
      ],
    },
    {
      category: '웹 서버 / 프록시',
      labels: [
        { label: 'Nginx', color: 'success' },
        { label: 'Apache', color: 'error' },
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
        이 프로젝트는 일본 도쿄 23구의 부동산 데이터를 크롤링하여 TensorFlow 기반의 신경망 모델로 
        집 값을 예측하는 웹 서비스입니다. Laravel 프론트엔드와 Python/Tornado 백엔드로 구성되어 있으며,
        Redis 캐싱을 통해 성능을 최적화했습니다.
      </Typography>
    </Box>
  );
}

function ProjectStructureSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 1
        }}
      >
        <ArchitectureIcon color="secondary" /> 프로젝트 구조
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        이 프로젝트는 두 개의 주요 부분으로 구성되어 있습니다:
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* 프론트엔드 카드 */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          display: 'flex'
        }}>
          <Card elevation={2} sx={{ 
            width: '100%', 
            borderLeft: '4px solid #f50057'
          }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <strong>Laravel [PHP]</strong> (프론트엔드)
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li>Laravel 프레임워크 기반 웹 인터페이스</li>
                  <li>사용자 입력을 받아 API 서버로 전달</li>
                  <li>Redis 캐싱을 통한 성능 최적화</li>
                  <li>월세 예측 결과 표시</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* 백엔드 카드 */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          display: 'flex'
        }}>
          <Card elevation={2} sx={{ 
            width: '100%', 
            borderLeft: '4px solid #3f51b5'
          }}>
            <CardContent>
              <Typography variant="h6" color="secondary" gutterBottom>
                <strong>Tornado [Python]</strong> (백엔드)
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li>Tornado 웹 서버 기반 API 서비스</li>
                  <li>머신러닝 모델을 통한 집 값 예측 처리</li>
                  <li>데이터 수집 및 학습 모듈 포함</li>
                  <li>신경망 모델 훈련 및 저장</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

function DataFlowSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 1 
        }}
      >
        <DataObjectIcon color="success" /> 데이터 처리 흐름
      </Typography>
      
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        <CardContent>
          <Grid container spacing={1} sx={{m: -1, mb: -2 }}>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Box sx={{ 
                p: 1,
                borderRadius: 2,
                bgcolor: '#e3f2fd',
                border: '1px solid #bbdefb'
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    1. 데이터 수집
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 0, pl: 3 }}>
                  - 일본 부동산 사이트에서 도쿄 23구 집 데이터 크롤링<br />
                  - 주소, 역까지 거리, 건축년도, 층수, 집 값, 화장실 분리 여부, 면적 데이터 수집<br />
                  - 수집 데이터를 house.csv 파일로 저장<br />
                  <Typography variant="caption" color="textSecondary">
                    파일 경로: scraping/scraping.py
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Box sx={{ 
                p: 1,
                borderRadius: 2,
                bgcolor: '#fff8e1',
                border: '1px solid #ffecb3'
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    2. 모델 학습
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 0, pl: 3 }}>
                  - house.csv 데이터 로드 및 전처리<br />
                  - 주소를 더미변수로 변환하여 28개 특성으로 확장<br />
                  - TensorFlow를 사용한 3층 신경망 모델 구축 및 학습<br />
                  - 학습된 모델 저장<br />
                  <Typography variant="caption" color="textSecondary">
                    파일 경로: learning_model/neuralnet.py
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2,
                bgcolor: '#e8f5e9',
                border: '1px solid #c8e6c9'
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    3. 사용자 입력 처리 (프론트엔드)
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ pl: 3 }}>
                  - public/js/app.js에서 사용자 입력 폼 처리<br />
                  - 입력값: 주소(address), 역까지 거리(dis_to_station), 건축년도(year_of_cons), 층수(floors), 면적(area)<br />
                  - AJAX를 통해 ServerController로 데이터 전송<br />
                  <Typography variant="caption" color="textSecondary">
                    파일 경로: public/js/app.js
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2,
                bgcolor: '#f3e5f5',
                border: '1px solid #e1bee7'
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    4. API 요청 처리
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ pl: 3 }}>
                  - ServerController.php에서 입력값 검증 후 백엔드 API 요청<br />
                  - Redis 캐시 확인 후 없으면 API 호출하여 결과 획득<br />
                  <Typography variant="caption" color="textSecondary">
                    파일 경로: app/Http/Controllers/ServerController.php
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2,
                bgcolor: '#e8eaf6',
                border: '1px solid #c5cae9'
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    5. 예측 처리
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ pl: 3 }}>
                  - Tornado 웹 서버에서 API 요청 수신<br />
                  - 입력 데이터 정규화<br />
                  - 학습된 신경망 모델 로드 및 예측 수행<br />
                  - 결과값 반환<br />
                  <Typography variant="caption" color="textSecondary">
                    파일 경로: data_handler/house_handler.py
                  </Typography>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

function CacheSection() {
  const phpCode = `$md5_key = md5(json_encode($request->all())); // 요청 파라미터를 기반으로 md5 캐시 키 생성

try { // 캐시에 있는지 확인
    $redis_value = Redis::hGetAll($md5_key);  // Redis에서 캐시된 값 조회

    if(!empty($redis_value)) {  // 캐시가 있으면 API 요청 없이 캐시된 값 사용
        $response = $redis_value["value"];
    } else{  // 캐시가 없으면 API 요청
        $response = $api->apiRequest('GET', '/predict/house/', $param);
    }
    $request->merge(['value' => $response]);
}`;

  const neuralnetCode = `with tf.variable_scope(file, reuse=tf.AUTO_REUSE) as scope:
    L1 = tf.layers.dense(x, units=10, activation=tf.nn.relu, name=file+"L1")
    L2 = tf.layers.dense(L1, units=10, activation=tf.nn.relu, name=file+"L2")
    L3 = tf.layers.dense(L2, units=1, activation=None, name=file+"L3")
    loss = tf.reduce_mean( 0.5*tf.square(L3-y) )
    train = tf.train.AdamOptimizer(0.1).minimize(loss)`;

  const handlerCode = `with tf.compat.v1.variable_scope(file, reuse=tf.compat.v1.AUTO_REUSE) as scope:
    x = tf.compat.v1.placeholder(tf.float32, [None,28])

    L1 = tf.compat.v1.layers.dense(x, units=10, activation=tf.nn.relu, name=file+"L1")
    L2 = tf.compat.v1.layers.dense(L1, units=10, activation=tf.nn.relu, name=file+"L2")
    L3 = tf.compat.v1.layers.dense(L2, units=1, activation=None, name=file+"L3")

    saver = tf.compat.v1.train.Saver()
    sess = tf.compat.v1.Session()
    saver.restore(sess, './learning_model/model/'+file + '.ckpt-0')`;

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0 }}>
        <Box
          component="img"
          src="/images/neural.png"
          alt="Neural Network"
          sx={{ 
            width: 36, 
            height: 36,
            objectFit: 'contain'
          }}
        />
        <Typography variant="h6">
          3 Layer Neural Network Code
        </Typography>
      </Stack>

      <Box sx={{ mb: 1 }}>
        <CodeAccordion 
          title="훈련 모델 정의/학습 부분 - learning_model/neuralnet.py"
          codeString={neuralnetCode}
          language="python"
        />
        <CodeAccordion 
          title="Tornado 에서 예측 시 사용하는 부분 - data_handler/house_handler.py"
          codeString={handlerCode}
          language="python"
        />
      </Box>

      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mt: 2,
          mb: 2
        }}
      >
        <StorageIcon color="error" /> 캐시 최적화
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        Redis를 활용한 캐싱 전략으로 중복 API 호출을 줄이고 응답 속도를 향상시켰습니다. 
        입력 파라미터의 해시값을 키로 사용하여 동일한 조건의 예측 결과를 효율적으로 재사용합니다.
      </Typography>

      <Box sx={{ mb: 1 }}>
        <CodeAccordion 
          title="ServerController.php의 캐시 로직"
          codeString={phpCode}
          language="php"
        />
      </Box>
      
      <Typography variant="body2" color="textSecondary">
        이 캐싱 방식으로 동일한 입력 파라미터에 대한 예측 결과를 캐싱함으로써 API 호출 횟수를 줄이고 응답 속도를 향상시켰습니다.
      </Typography>
    </Box>
  );
}

function ServerStructureSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        🖥️ 서버 구성도
      </Typography>
      
      <Typography variant="body1" component="p" sx={{ mb: 1 }}>
        AWS EC2 위에서 Laravel이 메인 API 요청을 처리하고, 내부적으로는 Nginx를 통해 Python(Tornado) + Gunicorn 서버로 프록시됩니다.
        Redis는 캐시 저장소로 활용하며, Supervisord가 Gunicorn을 관리합니다.
      </Typography>

      <ZoomableImageModal
        imageSrc="/images/python-architecture.jpg"
        altText="머신러닝 서버 구성도"
        caption="머신러닝 서버 구성도"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: 3 }}
      />
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Box>
      <Reference
        spaLinks={[]}
        externalLinks={[
          {
            prefix: '실제 프로젝트 페이지:',
            href: 'https://hkpark130.p-e.kr:8200',
            label: 'https://hkpark130.p-e.kr:8200',
            highlighted: true
          },
          {
            prefix: 'ML(Laravel) 소스코드:',
            href: 'https://github.com/hkpark130/Predict-Home-Laravel',
            label: 'https://github.com/hkpark130/Predict-Home-Laravel'
          },
          {
            prefix: 'ML(Tornado) 소스코드:',
            href: 'https://github.com/hkpark130/Predict-Home-API',
            label: 'https://github.com/hkpark130/Predict-Home-API'
          }
        ]}
      />
    </Box>
  );
}

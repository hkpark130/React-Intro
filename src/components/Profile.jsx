import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  Divider,
  Link,
  Grid,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

/* =======================
   애니메이션 Variants 정의
   ======================= */
const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 },
  }),
};

export default function Profile() {
  return (
    <Container 
      maxWidth="md" 
      sx={{
        mx: "auto",
        py: { xs: 3, sm: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 1 },
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
          <motion.div variants={sectionVariant} custom={0}>
            <ProfileLinksSection />
          </motion.div>
          
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          
          <motion.div variants={sectionVariant} custom={1}>
            <CertificationsSection />
          </motion.div>
          
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          
          <motion.div variants={sectionVariant} custom={2}>
            <EducationSection />
          </motion.div>
        </motion.div>
      </Paper>
    </Container>
  );
}

function ProfileLinksSection() {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="600" color="primary.main">
        Profile
      </Typography>
      
      <Stack spacing={1.5} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GitHubIcon sx={{ mr: 1.5, color: '#333' }} />
          <Link 
            href="https://github.com/hkpark130" 
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            GitHub 이동
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LinkedInIcon sx={{ mr: 1.5, color: '#0077B5' }} />
          <Link 
            href="https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/" 
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            LinkedIn 이동
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            component="span"
            sx={{ 
              mr: 1.5, 
              color: '#D14836', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24
            }}
          >
            ✉️
          </Box>
          <Link 
            href="mailto:hkpark130@naver.com" 
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            hkpark130@naver.com
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

function CertificationsSection() {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
        sx={{
          borderBottom: '2.5px solid #5c6bc0',
          width: 'fit-content',
          mb: 3,
        }}
      >
        <EmojiEventsIcon sx={{ color: '#5c6bc0' }} />
        <Typography variant="h5" fontWeight="600">
          자격증
        </Typography>
      </Stack>
      
      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              image="/images/cka.png"
              alt="Kubernetes 자격증"
              sx={{ 
                height: 300,
                objectFit: 'contain',
                bgcolor: '#1a73e8',
                p: 0
              }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Certified Kubernetes Administrator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The Cloud Native Computing Foundation 인증
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{  display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              image="/images/aws.png"
              alt="AWS 자격증"
              sx={{ 
                height: 220,
                objectFit: 'contain',
                bgcolor: '#f5f5f5',
                p: 2
              }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AWS Certified Solutions Architect - Associate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amazon Web Services 인증
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function EducationSection() {
  return (
    <Box>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
        sx={{
          borderBottom: '2.5px solid #5c6bc0',
          width: 'fit-content',
          mb: 3,
        }}
      >
        <SchoolIcon sx={{ color: '#5c6bc0' }} />
        <Typography variant="h5" fontWeight="600">
          수상경력
        </Typography>
      </Stack>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ZoomableAwardCard 
            imageSrc="/images/award1.png"
            title="JAVA 프로그래밍 경진대회"
            organization="한빛미디어 개최 (은상)"
            year="2016"
            linkUrl="http://cafe.naver.com/thisisjava/11141"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ZoomableAwardCard 
            imageSrc="/images/award2.png"
            title="신규 사업 아이디어 콘테스트"
            organization="KWC 개최 (장려상)"
            year="2018"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function ZoomableAwardCard({ imageSrc, title, organization, year, linkUrl }) {
  const [isModalOpen, setModalOpen] = React.useState(false);
  
  return (
    <>
      <Card 
        elevation={1} 
        sx={{ 
          cursor: 'pointer',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.03)',
          }
        }}
        onClick={() => setModalOpen(true)}
      >
        <CardMedia
          component="img"
          image={imageSrc}
          alt={title}
          sx={{ height: 280 }}
        />
        <CardContent>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{organization}</Typography>
          <Typography variant="body2" color="text.secondary">{year}</Typography>
          {linkUrl && (
            <Link 
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                mt: 1,
                fontSize: '1.25rem'
              }}
            >
              작품 소개 보기
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-block', 
                  ml: 0.5,
                  fontSize: '1rem'
                }}
              >
                →
              </Box>
            </Link>
          )}
        </CardContent>
      </Card>
      
      {isModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
          onClick={() => setModalOpen(false)}
        >
          <Box
            component="img"
            src={imageSrc}
            alt={title}
            sx={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: 1
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      )}
    </>
  );
}

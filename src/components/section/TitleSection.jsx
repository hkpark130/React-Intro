import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

/**
 * TitleSection
 * - 페이지의 주요 제목(title)과 부제목(subtitle), 설명(description)을 표시하는 컴포넌트입니다.
 * - 웹 디자인에서 'Hero Section'은 메인 비주얼 영역을 가리키는 용어이나,
 *   컴포넌트 명을 직관적으로 바꾸고 싶다면 'TitleSection' 또는 'HeaderSection'으로 사용할 수 있습니다.
 *
 * Props:
 *  - title: 메인 타이틀 텍스트 (required)
 *  - subtitle: 부제목 텍스트 (optional)
 *  - description: 추가 설명 텍스트 (optional)
 *  - sx: Box 컴포넌트 스타일을 override 할 때 사용 (optional)
 */
export default function TitleSection({ title, subtitle, description, sx }) {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
        textAlign: 'center',
        boxShadow: 3,
        ...sx
      }}
    >
      <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="h6" component="h2" gutterBottom>
          {subtitle}
        </Typography>
      )}
      {description && (
        <Typography variant="body1">
          {description}
        </Typography>
      )}
    </Box>
  );
}

TitleSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  sx: PropTypes.object
};

TitleSection.defaultProps = {
  subtitle: '',
  description: '',
  sx: {}
};

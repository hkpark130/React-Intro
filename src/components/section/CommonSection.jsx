import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

/**
 * CommonSection
 * - 제목(title)과 본문(body)을 텍스트 또는 ReactNode 형태로 렌더링하는 재사용 가능한 섹션 컴포넌트입니다.
 * - title: ReactNode 타입으로 MUI Icon이나 이모지 포함 가능
 * - body: 멀티라인 문자열로 전달 시 줄바꿈을 적용하여 각 문단을 Typography로 분리
 *
 * Props:
 *  - title: ReactNode (required)
 *  - body: string | ReactNode (required)  // 문자열일 경우 '\n' 기준으로 분할
 *  - sx: Box 스타일 오버라이드 (optional)
 */
export default function CommonSection({ title, body, sx }) {
  // 문자열로 받은 경우, '\n'으로 분할하여 각 줄을 <Typography>로 렌더링
  const renderBody = () => {
    if (typeof body === 'string') {
      return body.split(/\r?\n/).map((line, idx) => (
        <Typography
          key={idx}
          variant="body1"
          component="p"
          sx={{ mb: idx < body.split(/\r?\n/).length - 1 ? 1.5 : 0 }}
        >
          {line}
        </Typography>
      ));
    }
    // ReactNode 형태로 전달된 경우 그대로 렌더링
    return body;
  };

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 }, ...sx }}>
      <Box component="div" sx={{ mb: 1 }}>
        {typeof title === 'string' ? (
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
        ) : (
          title
        )}
      </Box>
      {renderBody()}
    </Box>
  );
}

CommonSection.propTypes = {
  title: PropTypes.node.isRequired,
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  sx: PropTypes.object
};

CommonSection.defaultProps = {
  sx: {}
};

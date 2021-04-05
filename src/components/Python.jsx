import React from 'react';
import imgPython from '../images/python.png';

function Python() {
    return(
        <div class="component">
            <h1>Python</h1>
            <div>
                <img
                    src={ imgPython }
                    width='230'
                    height='128'
                />
            </div>
            <pre>
                할 것들<br/>
                도쿄 23구 집 값 예측 (크롤링으로 학습 데이터 모으기, dense신경망으로 모델구축)<br/>
                챗 봇 (LSTM으로 모델 구축, mecab 형태소분석 사용, 학습 데이터...)
            </pre>
                
            <a href='#'>
                <h2>서버로 이동</h2>
            </a>
        </div>
        
    );
}

export default Python;
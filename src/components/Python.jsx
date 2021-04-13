import React from 'react';
import imgPython from '../images/python.png';

function Python() {
    return(
        <div class="component">
            <h1>Python</h1>
            채팅 봇(lstm), 집 값 예측(신경망) 기획중 <br/>
            독학중이라 accuracy가 낮습니다..
            <div>
                <pre>
                    <ul>
                        <li>
                            <b>API:</b> Python (Tornado Framework), nginx
                        </li>
                        <li>
                            <b>백엔드:</b> Laravel
                        </li>
                    </ul> 
                </pre>
            </div>

            <h1>프로젝트 링크</h1>
            <a href='#'>
                <h2>서버로 이동</h2>
            </a>

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
        </div>
        
    );
}

export default Python;
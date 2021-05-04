import React from 'react';
import imgPython from '../images/ML.jpg';

function Python() {
    return(
        <div class="component">
            <h1>머신러닝 (Python)</h1>
            「채팅 봇(LSTM), 도쿄 23구 집 값 예측(신경망)」 프로젝트를 기획하여 만들어 보았습니다. <br/>
            독학중이라 accuracy가 낮습니다..
            <div>
                <pre>
                    <ul>
                        <li>
                            <b>API:</b> Python3 (Tornado Framework), nginx -> Supervisor( Gunicorn )
                        </li>
                        <li>
                            <b>백엔드:</b> Laravel8
                        </li>
                        <li>
                            <b>NoSQL DB:</b> Redis
                        </li>
                        <li>
                            <b>학습모델:</b> Tensorflow
                        </li>
                    </ul> 
                </pre>
            </div>

            <h1>프로젝트 링크</h1>
            <a href='https://hkpark130.p-e.kr:8200/'>
                <h2>머신러닝 페이지로 이동</h2>
            </a>

            <h1>서버 구성도</h1>
                <img
                    src={ imgPython }
                    width='900'
                    height='580'
                />

            <pre>
                앞으로 할 것들<br/>
                <del>1. 집 값 예측(dense Neural Network)</del><br/>
                2. 챗 봇 (LSTM 모델구축, mecab 형태소분석 사용, 학습 데이터 구하기...)<br/>
            </pre>

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                ML(Laravel) 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/Predict-Home-Laravel'>
                    <u>https://github.com/hkpark130/Predict-Home-Laravel</u>
                </a>
                를 확인해주세요.<br/>
                ML(Tornado) 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/Predict-Home-API'>
                    <u>https://github.com/hkpark130/Predict-Home-API</u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
        </div>
        
    );
}

export default Python;
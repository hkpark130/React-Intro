import React from 'react';
import imgPython from '../images/ML.jpg';
import imgMovePage from '../images/movepage.jpg';

function Python() {
    return(
        <div class="component">
            <h1>머신러닝 (Python)</h1>
            「도쿄 23구 집 값 예측(신경망)」 프로젝트를 기획하여 만들어 보았습니다. <br/>
            독학중이라 accuracy가 낮습니다..
            직접 크롤링으로 부동산 데이터를 수집하여 가공하고 학습시켰습니다.
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
                <h2>
                    <img
                        src={ imgMovePage }
                        width='18'
                        height='18'
                    />{" "}
                    머신러닝 페이지로 이동
                </h2>
            </a>

            <h1>서버 구성도</h1>
                <img
                    src={ imgPython }
                    width='900'
                    height='580'
                />

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                ML(Laravel) 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/Predict-Home-Laravel'>
                    <u>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />
                        https://github.com/hkpark130/Predict-Home-Laravel
                    </u>
                </a>
                를 확인해주세요.<br/>
                ML(Tornado) 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/Predict-Home-API'>
                    <u>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />
                        https://github.com/hkpark130/Predict-Home-API
                    </u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
        </div>
        
    );
}

export default Python;

import React from 'react';
import imgPipeline from '../images/pipeline.jpg';
import imgIntroDia from '../images/intro-dia.jpg';
import imgMovePage from '../images/movepage.jpg';

function Intro() {
    return(
        <div class="component">
            <h1>인트로 (React)</h1>
            <div>
                안녕하세요. <br/>
                해당 페이지는 인트로 페이지로써 각 프로젝트에 대해서 소개하는 페이지입니다. <br/>
                
            </div>
            <div>
                <pre>
                    <ul>
                        <li>
                            <b>개발환경:</b> Docker
                        </li>
                        <li>
                            <b>프론트엔드:</b> React
                        </li>
                        <li>
                            <b>CD:</b> AWS CodePipeline (S3, CodeDeploy)
                        </li>
                    </ul> 
                </pre>
            </div>
            
            <div>
                <h1>코드 파이프라인</h1>
                <img
                    src={ imgPipeline }
                    width='1050'
                    height='680'
                />
            </div>

            <div>
                <h1>서버 구성도</h1>
                <img
                    src={ imgIntroDia }
                />
            </div>

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                인트로 페이지 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/React-Intro'>
                    <u>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />
                        https://github.com/hkpark130/React-Intro
                    </u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
        </div>
        
    );
}

export default Intro;

import React from 'react';
import imgPipeline from '../images/pipeline.jpg';
import imgIntroDia from '../images/intro-dia.jpg';

function Intro() {
    return(
        <div class="component">
            <h1>인트로</h1>
            <div>
                안녕하세요. 시간날 때 혼자서 개발중입니다.
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
                            <b>CD:</b> AWS CodePipeline (S3, CodeBuild, CodeDeploy)
                        </li>
                    </ul> 
                </pre>
            </div>
            
            <div>
                <h1>코드 파이프라인</h1>
                <img
                    src={ imgPipeline }
                    width='1000'
                    height='1105'
                />
                <div>
                    <u>
                    사실 S3와 CodeBuild까지 사용할 필요는 없었지만 비용 문제로 
                    소스 커밋 빈도가 낮은 리액트 프로젝트에만 적용하여 공부해보기로 하였습니다.
                    </u>
                </div>
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
                    <u>https://github.com/hkpark130/React-Intro</u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
        </div>
        
    );
}

export default Intro;
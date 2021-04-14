import React from 'react';
import imgSpring from '../images/spring-dia.png';

function Spring() {
    return(
        <div class="component">
            <h1>Spring</h1>
                Spring Boot를 이용하여 웹을 만들어보았습니다.<br/>
                사용했던 기술들을 정리하고 공유하기 위한 블로그를 기획하였습니다.
                <div>
                    <pre>
                        <ul>
                            <li>
                                <b>개발환경:</b> Docker
                            </li>
                            <li>
                                <b>백엔드:</b> Spring Boot
                            </li>
                            <li>
                                <b>DB:</b> AWS RDS
                            </li>
                            <li>
                            <b>CD:</b> AWS CodePipeline (CodeDeploy)
                            </li>
                        </ul> 
                    </pre>
                </div>

                <h1>프로젝트 링크</h1>
                <a href='https://hkpark130.p-e.kr:8100/'>
                    <h2>스프링 블로그 서버로 이동</h2>
                </a>

                <h1>서버 구성도</h1>
                <img
                    src={ imgSpring }
                    width='800'
                    height='431'
                />

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                스프링 블로그 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/Spring-Blog'>
                    <u>https://github.com/hkpark130/Spring-Blog</u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
        </div>
        
    );
}

export default Spring;
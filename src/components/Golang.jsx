import React from 'react';
import imgGolang from '../images/golang.jpg';
import imgJwt from '../images/jwt.jpg';
import imgMovePage from '../images/movepage.jpg';

function Golang() {
    return(
        <div class="component">
            <h1>JWT 인증 (Golang)</h1>
                Go 언어를 이용하여 JWT 방식 인증 웹을 만들어 보았습니다.<br/>
                Refresh Token 으로 Access token의 유효기간이 얼마 남지 않았다면 재발급하도록 구현하였습니다.<br/>
                Golang 컨테이너의 3000 port를 외부로 공개하지 않기 위해서 Proxy를 사용하여 통신하도록 구현하였습니다.
                <div>
                    <pre>
                        <ul>
                            <li>
                                <b>개발환경:</b> Docker
                            </li>
                            <li>
                                <b>컨테이너:</b> 
                                    <ol>
                                        <li>Golang [백엔드]</li>
                                        <li>PostgreSQL [DB]</li>
                                        <li>Redis [캐시]</li>
                                        <li>Apache (proxy) [프론트 엔드]</li>
                                        <li>godoc [API 문서]</li>
                                    </ol>
                            </li>
                            <li>
                                <b>CD:</b> AWS CodePipeline (CodeDeploy)
                            </li>
                        </ul> 
                    </pre>
                </div>

                <h1>프로젝트 링크</h1>
                <a href='https://hkpark130.p-e.kr:8300/'>
                    <h2>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />{" "}
                        Go JWT 페이지로 이동
                    </h2>
                </a>

                <h1>JWT 인증 처리 흐름</h1>
                <img
                    src={ imgJwt }
                    width='1000'
                    height='630'
                />

                <h1>서버 구성도</h1>
                <img
                    src={ imgGolang }
                    width='800'
                    height='740'
                />

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                스프링 블로그 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/go-jwt'>
                    <u>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />
                        https://github.com/hkpark130/go-jwt
                    </u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
        </div>
        
    );
}

export default Golang;

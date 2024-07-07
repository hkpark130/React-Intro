import React from 'react';
import imgPacketbeat from '../images/packetbeat.png';
import imgOpensearch from '../images/opensearch.jpg';
import imgMovePage from '../images/movepage.jpg';
import imgDraw from '../images/opensearch-docker.png'

function Opensearch() {
    return(
        <div class="component">
            <h1>오픈서치 대시보드 (OpenSearch DashBoard)</h1>
                OpenSearch 기반의 모니터링 DashBoard 를 구축해 보았습니다.<br/>
                자세한 설정 파일과 설치 방법 및 트러블 슈팅은 Github 주소를 참고해주세요.<br/>
                <div>
                    <pre>
                        <ul>
                            <li>
                                <b>개발환경:</b> Docker
                            </li>
                            <li>
                                <b>로그 수집:</b> PacketBeat
                            </li>
                            <li>
                                <b>로그 전송:</b> Logstash
                            </li>
                            <li>
                                <b>로그 저장:</b> OpenSearch
                            </li>
                            <li>
                                <b>시각화:</b> OpenSearch DashBoard
                            </li>
                        </ul> 
                    </pre>
                </div>

                <h1>프로젝트 링크</h1>
                <a href='http://13.124.201.92:5601/' target='_blank'>
                    <h2>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />{" "}
                        <strike>오픈서치 대시보드 페이지로 이동</strike>
                    </h2>
                </a>
                <h3>
                    <span class="red-text">※ EC2 리소스(1vCPU, 1G) 부족으로 인해 현재는 종료하고 있습니다.</span> <br/>
                    로컬에서 실행 가능하기 때문에 Github의 docker-compose.yml 파일을 참고해주세요. <br/>
                    SSL 인증서 적용시 Security Plugins 도 설치되기 때문에 리소스를 더 사용하게 됩니다.
                </h3>

                <h1>서버 구성도</h1>
                <img
                    src={ imgDraw }
                /><br/>

                Packetbeat로 모든 네트워크 인터페이스에서 HTTP 프로토콜을 사용하는 포트들의 로깅을 설정하였습니다. <code>network_mode: "host"</code> <br/><br/>
                <img
                    src={ imgPacketbeat }
                />

                <br/><br/>

                <img
                    src={ imgOpensearch }
                />

                <img
                    src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbXBIcA%2FbtsIp55LxwI%2FEMo4n4Hx1Z2HGK73El7US1%2Fimg.png"
                />

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                오픈서치 설정 파일들은&nbsp;
                <a href='https://github.com/hkpark130/opensearch' target='_blank'>
                    <u>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />
                        https://github.com/hkpark130/opensearch
                    </u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
        </div>
        
    );
}

export default Opensearch;

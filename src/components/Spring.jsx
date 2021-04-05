import React from 'react';
import imgSpring from '../images/spring_boot.png';

function Spring() {
    return(
        <div class="component">
            <h1>Spring</h1>

            <div>
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
                <img
                    src={ imgSpring }
                    width='256'
                    height='128'
                />
            </div>

            <a href='https://hkpark130.p-e.kr:8100/'>
                <h2>서버로 이동</h2>
            </a>
        </div>
        
    );
}

export default Spring;
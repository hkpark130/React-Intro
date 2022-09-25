import React from 'react';
import imgMovePage from '../images/movepage.jpg';

function Terraform() {
    return(
        <div class="component">
            <h1>IaC (Terraform)</h1>
            각 프로젝트의 인프라 리소스를 Terraform으로 관리하도록 하였습니다. <br/>
            <div>
                <pre>
                    <ul>
                        <li>
                            <b>CICD:</b> Github Actions 
                            <a href='https://github.com/hkpark130/terraform/tree/main/.github/workflows'>(workflows 코드)</a>
                        </li>
                        <li>
                            <b>Provider:</b> AWS
                        </li>
                    </ul> 
                </pre>
            </div>

            <div>
                <h1>Workflow</h1>
                각 프로젝트마다 폴더가 있으며 Makefile로 테라폼 명령어를 실행<br></br>
                modules 에 있는 파일들을 불러오고 테라폼 초기세팅을 위해 `make setup` 명령어를 먼저 실행<br></br>
                `terraform plan`은 var-file 설정이 되도록 `make plan` 명령어로 실행<br></br>
                `terraform apply`은 Github Actions로 실행<br></br>
            </div>

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                Terraform 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/terraform'>
                    <u>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />
                        https://github.com/hkpark130/terraform
                    </u>
                </a>
                를 확인해주세요.<br/>
            </div>
        </div>
        
    );
}

export default Terraform;

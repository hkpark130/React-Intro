import React from 'react';
import imgMovePage from '../images/movepage.jpg';
import imgGithubActionsApply from '../images/github-actions-apply.jpg';
import imgGithubActionsPlan from '../images/github-actions-plan.jpg';
import imgGithubActionsBot from '../images/github-actions-bot.jpg';
import imgGithubActions from '../images/github-actions.jpg';

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
                            <a href='https://github.com/hkpark130/terraform/tree/main/.github/workflows' target='_blank'>(workflows 코드)</a>
                        </li>
                        <li>
                            <b>Provider:</b> AWS
                        </li>
                    </ul> 
                </pre>
            </div>

            <div>
                <h1>Github Actions</h1>
                main 브랜치에 PR 생성하면 Github Actions에서도 Plan 명령어를 실행후 bot으로 결과 출력<br></br>
                <img
                    src={ imgGithubActionsPlan }
                    width='300'
                    height='137'
                /><br></br>
                release 브랜치에 push하면 apply 명령어 실행후 bot으로 결과 출력<br></br>
                <img
                    src={ imgGithubActionsApply }
                    width='309'
                    height='138'
                /><br></br>
                <img
                    src={ imgGithubActionsBot }
                    width='800'
                    height='552'
                />
                <img
                    src={ imgGithubActions }
                    width='900'
                    height='488'
                />
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
                <a href='https://github.com/hkpark130/terraform' target='_blank'>
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

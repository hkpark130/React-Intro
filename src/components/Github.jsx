import React from 'react';
import imgGithub from '../images/github.png';

function Github() {
    return(
        <div class="component">
            <h1>Github</h1>

            <div>
                <img
                    src={ imgGithub }
                    width='256'
                    height='128'
                />
            </div>

            <a href='https://github.com/hkpark130'>
                <h2>Github 서버로 이동</h2>
            </a>
        </div>
        
    );
}

export default Github;
import React from 'react';

function Loading(props) {
    return (
        <main>
            <div className="h-screen flex justify-center items-center">
                <img src="/assests/astronaut_load.gif"/>
                <span className="visually-hidden">
                    </span>
            </div>
        </main>
    );
}

export default Loading;
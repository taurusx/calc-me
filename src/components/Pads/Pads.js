import React from 'react';
import './Pads.css';

function Pads(props) {
  return (<div className="Pads">
    { props.children }
    </div>)
}

export default Pads;
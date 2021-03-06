import React from 'react';
import PropTypes from 'prop-types';
import createFragment from 'react-addons-create-fragment';

import Node from './Node';

const valueStyles = {
  func: {
    color: '#170',
  },

  attr: {
    color: '#666',
  },

  object: {
    color: '#666',
  },

  array: {
    color: '#666',
  },

  number: {
    color: '#a11',
  },

  string: {
    color: '#22a',
    wordBreak: 'break-word',
  },

  bool: {
    color: '#a11',
  },

  empty: {
    color: '#777',
  },
};

function previewArray(val, propValProps) {
  const { maxPropArrayLength } = propValProps;
  const items = {};
  val.slice(0, maxPropArrayLength).forEach((item, i) => {
    items[`n${i}`] = <PropVal {...propValProps} singleLine={false} braceWrap={false} val={item} />;
    items[`c${i}`] = ', ';
  });
  if (val.length > maxPropArrayLength) {
    items.last = '…';
  } else {
    delete items[`c${val.length - 1}`];
  }
  return (
    <span style={valueStyles.array}>
      [{createFragment(items)}]
    </span>
  );
}

function previewObject(val, propValProps) {
  const { maxPropObjectKeys } = propValProps;
  const names = Object.keys(val);
  const items = {};
  names.slice(0, maxPropObjectKeys).forEach((name, i) => {
    items[`k${i}`] = (
      <span style={valueStyles.attr}>
        {name}
      </span>
    );
    items[`c${i}`] = ': ';
    items[`v${i}`] = <PropVal {...propValProps} singleLine={false} braceWrap={false} val={val[name]} />;
    items[`m${i}`] = ', ';
  });
  if (names.length > maxPropObjectKeys) {
    items.rest = '…';
  } else {
    delete items[`m${names.length - 1}`];
  }
  return (
    <span style={valueStyles.object}>
      {'{'}
      {createFragment(items)}
      {'}'}
    </span>
  );
}

export default function PropVal(props) {
  const {
    braceWrap: _branceWrap,
    showSourceOfProps,
    maxPropsIntoLine,
    maxPropObjectKeys,
    maxPropArrayLength,
    maxPropStringLength,
  } = props;
  let val = props.val;
  let braceWrap = _branceWrap;
  let content = null;

  if (typeof val === 'number') {
    content = (
      <span style={valueStyles.number}>
        {val}
      </span>
    );
  } else if (typeof val === 'string') {
    if (val.length > maxPropStringLength) {
      val = `${val.slice(0, maxPropStringLength)}…`;
    }
    content = (
      <span style={valueStyles.string}>
        "{val}"
      </span>
    );
    braceWrap = false;
  } else if (typeof val === 'boolean') {
    content = <span style={valueStyles.bool}>{`${val}`}</span>;
  } else if (Array.isArray(val)) {
    content = previewArray(val, {
        showSourceOfProps,
        maxPropsIntoLine,
        maxPropObjectKeys,
        maxPropArrayLength,
        maxPropStringLength,
    });
  } else if (typeof val === 'function') {
    content = (
      <span style={valueStyles.func}>
        {val.name ? `${val.name}()` : 'anonymous()'}
      </span>
    );
  } else if (!val) {
    content = <span style={valueStyles.empty}>{`${val}`}</span>;
  } else if (typeof val !== 'object') {
    content = <span>…</span>;
  } else if (React.isValidElement(val)) {
    if (showSourceOfProps) {
      content = (
        <span style={valueStyles.object}>
          <Node
            node={val}
            depth={0}
            showSourceOfProps={showSourceOfProps}
            maxPropsIntoLine={maxPropsIntoLine}
            maxPropObjectKeys={maxPropObjectKeys}
            maxPropArrayLength={maxPropArrayLength}
            maxPropStringLength={maxPropStringLength}
          />
        </span>
      );
    } else {
      content = (
        <span style={valueStyles.object}>
          {`<${val.type.displayName || val.type.name || val.type} />`}
        </span>
      );
    }
  } else {
    content = previewObject(val, {
        showSourceOfProps,
        maxPropsIntoLine,
        maxPropObjectKeys,
        maxPropArrayLength,
        maxPropStringLength,
    });
  }

  if (!braceWrap) return content;

  return (
    <span>
      {'{'}
      {content}
      {'}'}
    </span>
  );
}

PropVal.propTypes = {
  // val can't be required since it may be "null" (e.g. in defaultProps)
  val: PropTypes.any, // eslint-disable-line
  showSourceOfProps: PropTypes.bool.isRequired,
  braceWrap: PropTypes.bool,
  maxPropsIntoLine: PropTypes.number.isRequired,
  maxPropObjectKeys: PropTypes.number.isRequired,
  maxPropArrayLength: PropTypes.number.isRequired,
  maxPropStringLength: PropTypes.number.isRequired,
};

PropVal.defaultProps = {
  braceWrap: true,
};

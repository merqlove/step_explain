import { expect } from "chai";
import ConvertStepShot from '../src/index';

describe('demo', () => {
  it('works', () => {
    const result = ConvertStepShot({source: `${__dirname}/../demo/index.html`, dest: `${__dirname}/../tmp`});
    expect(result).to.equal(true);
  });
  it('fails', () => {
    const result = ConvertStepShot("some", {source: `${__dirname}/../demo/index.html`, dest: `${__dirname}/../tmp`});
    expect(result).to.equal(null);
  });
});

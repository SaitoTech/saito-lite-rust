// @flow
import linkify from '../';

describe('happy cases', () => {
  it('should markdown-linkify a URL', () => {
    const result = linkify('https://spectrum.chat');
    expect(result).toEqual('[https://spectrum.chat](https://spectrum.chat)');
  });

  it('should markdown-linkify a URL at the beginning of a sentence', () => {
    const result = linkify('https://spectrum.chat hello');
    expect(result).toEqual(
      '[https://spectrum.chat](https://spectrum.chat) hello'
    );
  });

  it('should markdown-linkify a URL at the end of a sentence', () => {
    const result = linkify('this is https://spectrum.chat');
    expect(result).toEqual(
      'this is [https://spectrum.chat](https://spectrum.chat)'
    );
  });

  it('should markdown-linkify a URL in the middle of a sentence', () => {
    const result = linkify('this is https://spectrum.chat here');
    expect(result).toEqual(
      'this is [https://spectrum.chat](https://spectrum.chat) here'
    );
  });

  it('should markdown-linkify multiple URLs', () => {
    const result = linkify('https://spectrum.chat https://google.com');
    expect(result).toEqual(
      '[https://spectrum.chat](https://spectrum.chat) [https://google.com](https://google.com)'
    );
    const result2 = linkify(
      'https://spectrum.chat https://google.com https://google.com'
    );
    expect(result2).toEqual(
      '[https://spectrum.chat](https://spectrum.chat) [https://google.com](https://google.com) [https://google.com](https://google.com)'
    );
  });

  it('should markdown-linkify multiple links in text', () => {
    const result = linkify(
      "this is https://spectrum.chat what' up https://google.com"
    );
    expect(result).toEqual(
      "this is [https://spectrum.chat](https://spectrum.chat) what' up [https://google.com](https://google.com)"
    );
  });

  it('should markdown-linkify multiple links at the beginning and end of text', () => {
    const result = linkify("https://spectrum.chat what' up https://google.com");
    expect(result).toEqual(
      "[https://spectrum.chat](https://spectrum.chat) what' up [https://google.com](https://google.com)"
    );
  });

  it('should markdown-linkify URLs without a protocol that have a common TLD', () => {
    const result = linkify('test spectrum.chat');
    expect(result).toEqual('test [spectrum.chat](http://spectrum.chat)');
  });

  it('should linkify mailto: links', () => {
    const text = 'An email mailto:hi@spectrum.chat';
    expect(linkify(text)).toEqual(
      'An email [mailto:hi@spectrum.chat](mailto:hi@spectrum.chat)'
    );
  });
});

describe('edge cases', () => {
  it('should not change text without URLs', () => {
    const text = 'test test 1, 2, 3';
    expect(linkify(text)).toEqual(text);
  });

  it('should not change text with punctuation marks', () => {
    const text = 'Sentence one. Another sentence.';
    expect(linkify(text)).toEqual(text);
  });

  it('should not change text with misplaced punctuation marks', () => {
    const text = 'Sentence one.Another sentence.';
    expect(linkify(text)).toEqual(text);
    const text2 = 'Sentence one.another sentence.';
    expect(linkify(text2)).toEqual(text2);
    const text3 = 'Sentence one.a sentence.';
    expect(linkify(text3)).toEqual(text3);
  });

  it('should not change text with misplaced punctuation marks that look like URLs', () => {
    const text = 'Sentence one is.also sentence two.';
    expect(linkify(text)).toEqual(text);
  });

  it("should change text with protocols before things even if they don't look like URLs", () => {
    const text = 'Sentence one https://is.also sentence two.';
    expect(linkify(text)).toEqual(
      'Sentence one [https://is.also](https://is.also) sentence two.'
    );
  });

  it('should not linkify an email', () => {
    const text = 'An email hi@spectrum.chat';
    expect(linkify(text)).toEqual('An email hi@spectrum.chat');
  });

  it('should not linkify markdown links', () => {
    const text = 'A link [to google](http://google.com)';
    expect(linkify(text)).toEqual(text);
  });

  it('should work with multiple links', () => {
    const text =
      'A link [to google](http://google.com) with another link to http://google.com';
    expect(linkify(text)).toEqual(
      'A link [to google](http://google.com) with another link to [http://google.com](http://google.com)'
    );
  });

  it('should work a bunch of links', () => {
    const text =
      'A link [to google](http://google.com) http://google.com [to google](http://google.com) http://google.com';
    expect(linkify(text)).toEqual(
      'A link [to google](http://google.com) [http://google.com](http://google.com) [to google](http://google.com) [http://google.com](http://google.com)'
    );
  });

  it('should link text containing parens', () => {
    const text = '[A link to (google)](http://google.com)';
    expect(linkify(text)).toEqual('[A link to (google)](http://google.com)');
  });

  it('should not transform markdown link with link as label', () => {
    const text = '[http://google.com](http://google.com)';
    expect(linkify(text)).toEqual('[http://google.com](http://google.com)');
  });

  it('should not transform markdown link with link as label with spaces', () => {
    const text = '[ http://google.com](http://google.com)';
    expect(linkify(text)).toEqual('[ http://google.com](http://google.com)');
  });
});

describe('sample test 101', () => {
  it('works as expected', () => {
    const age = 100;
    expect(1).toEqual(1);
    expect(age).toEqual(100);
  });

  // .skip or xit will skip specific test
  // it.skip('handles ranges just fine', () => {
  xit('handles ranges just fine', () => {
    const age = 200;
    expect(age).toBeGreaterThan(100);
  });

  // .only or fit will skip all other tests
  // it.only('makes a list of dog names', () => {
  fit('makes a list of dog names', () => {
    const dogs = ['snickers', 'hugo'];
    expect(dogs).toEqual(dogs);
    expect(dogs).toContain('snickers');
    expect(dogs).toContain('snickers');
  });
});

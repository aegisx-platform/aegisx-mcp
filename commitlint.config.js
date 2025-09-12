module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => commit.startsWith('chore(release):')],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Code style (formatting, missing semicolons, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding tests
        'build',    // Build system or dependencies
        'ci',       // CI/CD configuration
        'chore',    // Other changes that don't modify src or test
        'revert'    // Revert previous commit
      ]
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always']
  }
};
#!/usr/bin/env bash
# 打 Chrome Web Store 上传包。
# 用法：bash scripts/pack.sh [输出目录]   默认输出到 dist/
set -euo pipefail

cd "$(dirname "$0")/.."
OUT_DIR="${1:-dist}"
NAME="chrome-index-db-viewer"
VERSION="$(python3 -c 'import json;print(json.load(open("manifest.json"))["version"])')"
ZIP="$OUT_DIR/$NAME-$VERSION.zip"

# 进包的只有扩展运行时文件 + 许可证/隐私声明/说明文档；
# test-page.html 是开发用的测试页，docs/ 是商店素材，scripts/ 是构建脚本，都不进包
FILES=(manifest.json devtools.html devtools.js panel.html panel.js i18n.js _locales icons LICENSE PRIVACY.md README.md README.en.md)

mkdir -p "$OUT_DIR"
rm -f "$ZIP"

# -X 去掉额外文件属性，避免不同机器打出不同字节
zip -r -X -q "$ZIP" "${FILES[@]}" \
  -x '.DS_Store' -x '__MACOSX/*' -x '*/.*'

echo "生成：$ZIP"
echo "版本：$VERSION"
unzip -l "$ZIP"

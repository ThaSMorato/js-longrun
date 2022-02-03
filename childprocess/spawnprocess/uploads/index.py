# python index.py '{"filePath" : "my-data.csv", "url": "http://localhost:3000"}'
import sys
import json
from urllib import request

def main():
  item = json.loads(sys.argv[1])
  filePath  = item.get('filePath')
  url  = item.get('url')
  data = open(filePath, 'rb').read()
  req = request.Request(url, data)
  res = request.urlopen(req).read().decode('utf-8')
  print(res)

if __name__ == '__main__':
  main()
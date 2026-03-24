import urllib.parse
content = open('docs/encode_gravizo.py').read()
puml = content.split('puml = """')[1].split('"""')[0].strip()
r = 'https://g.gravizo.com/svg?' + urllib.parse.quote(puml)
# Print in 100-char chunks to avoid truncation
for i in range(0, len(r), 100):
    print(r[i:i+100])
